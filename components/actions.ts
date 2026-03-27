"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import connectDB from "@/app/lib/mongodb";
import { Cart, Category, Order } from "@/app/models/Schemas";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("usersessionId");

    redirect("/login");
  } catch (err: any) {
    // Re-throw redirect errors
    if (err.message?.includes("NEXT_REDIRECT")) {
      throw err;
    }

    console.error("Logout error:", err);
    throw new Error("Failed to logout");
  }
}

export async function addToCart(productId: string, quantity: number = 1) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const userId = cookieStore.get("usersessionId")?.value;

    if (!userId) {
      redirect("/login");
    }

    console.log(userId, productId, quantity);

    if (quantity <= 0) {
      return { success: false, message: "Quantity must be positive" };
    }

    // Atomic update: Try to increment quantity if item exists
    const cart = await Cart.findOneAndUpdate(
      { user: userId, "items.product": productId },
      { $inc: { "items.$.quantity": quantity } },
    );

    if (!cart) {
      // If item didn't exist (or cart didn't exist), push item or create cart
      await Cart.findOneAndUpdate(
        { user: userId },
        { $push: { items: { product: productId, quantity } } },
        { upsert: true },
      );
    }

    revalidatePath("/", "layout");
    return { success: true, message: "Item added to cart" };
  } catch (error: any) {
    if (error.message?.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Add to cart error:", error);
    return {
      success: false,
      message: error.message || "Failed to add to cart",
    };
  }
}

export async function getCategories() {
  noStore();
  try {
    await connectDB();
    const categories = await Category.find({}).sort({ name: 1 }).lean();

    return categories.map((category: any) => ({
      ...category,
      _id: category._id.toString(),
      createdAt: category.createdAt?.toISOString(),
      updatedAt: category.updatedAt?.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getUserOrders() {
  noStore(); // Opt-out of static rendering for this action
  try {
    await connectDB();
    const cookieStore = await cookies();
    const userId = cookieStore.get("usersessionId")?.value;

    if (!userId) {
      // If no user is logged in, return an empty array
      return [];
    }

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for plain JS objects

    // Map to a serializable format and ensure string IDs
    return orders.map((order) => ({
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      user: order.user.toString(), // Assuming user is just an ID here, not populated
      items: order.items.map((item: any) => ({
        product: item.product.toString(),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: order.total,
      shippingAddress: order.shippingAddress,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt?.toISOString(),
      updatedAt: order.updatedAt?.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
}

export async function removeFromCart(productId: string) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const userId = cookieStore.get("usersessionId")?.value;

    if (!userId) {
      return { success: false, message: "Please login" };
    }

    await Cart.updateOne(
      { user: userId },
      { $pull: { items: { product: productId } } },
    );
    revalidatePath("/cart");
    return { success: true, message: "Item removed from cart" };
  } catch (error: any) {
    console.error("Remove from cart error:", error);
    return { success: false, message: "Failed to remove from cart" };
  }
}

export async function getCart() {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const userId = cookieStore.get("usersessionId")?.value;

    if (!userId) return null;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    return cart ? JSON.parse(JSON.stringify(cart)) : null;
  } catch (error) {
    console.error("Get cart error:", error);
    return null;
  }
}

export async function createOrder(orderData: {
  shippingAddress: any;
}): Promise<{ success: boolean; error?: string; checkoutUrl?: string }> {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const userId = cookieStore.get("usersessionId")?.value;

    if (!userId)
      return { success: false, error: "Please login to place an order" };

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0)
      return { success: false, error: "Your cart is empty" };

    const total = cart.items.reduce((acc: number, item: any) => {
      return acc + item.product.price * item.quantity;
    }, 0);

    const orderItems = cart.items.map((item: any) => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    }));

    // Create order first with pending status
    const newOrder = await Order.create({
      orderNumber: `ORD-${Date.now().toString().slice(-8)}`,
      user: userId,
      items: orderItems,
      total,
      shippingAddress: orderData.shippingAddress,
      status: "pending",
      paymentStatus: "pending",
    });

    // Create Stripe line items from cart
    const lineItems = cart.items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.name,
          // images: [item.product.imageUrl], // optional
        },
        unit_amount: Math.round(item.product.price * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }));

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      // Pass your order ID so the webhook knows which order to update
      metadata: {
        orderId: newOrder._id.toString(),
        userId: userId,
      },
      customer_email: orderData.shippingAddress.email,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order-success?orderId=${newOrder._id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?cancelled=true`,
    });

    // Clear cart only after session is created successfully
    // WARNING: Clearing cart here means if user cancels payment, cart is lost.
    // await Cart.deleteOne({ user: userId });
    revalidatePath("/");

    return { success: true, checkoutUrl: session.url! };
  } catch (error: any) {
    console.error("Create order error:", error);
    return { success: false, error: error.message || "Failed to place order" };
  }
}

export async function getOrder(orderId: string) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const userId = cookieStore.get("usersessionId")?.value;

    if (!userId) return null;

    const order = await Order.findById(orderId).populate("items.product");
    if (!order) return null;

    // Security Check: Ensure the order belongs to the logged-in user
    if (order.user.toString() !== userId) {
      return null;
    }

    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    console.error("Error getting order:", error);
    return null;
  }
}
