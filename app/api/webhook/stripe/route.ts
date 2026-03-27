import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import connectDB from "@/app/lib/mongodb";
import { Order } from "@/app/models/Schemas";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook error: ${err.message}` },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { orderId } = session.metadata!;

    await connectDB();
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "confirmed",
      status: "payment_received",
      paymentId: session.payment_intent as string,
    });
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { orderId } = session.metadata!;

    await connectDB();
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "failed",
      status: "cancelled",
    });
  }

  return NextResponse.json({ received: true });
}
