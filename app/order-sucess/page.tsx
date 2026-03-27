import { getOrder } from "@/components/actions";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OrderSuccessPage(props: {
  searchParams: Promise<{ orderId: string }>;
}) {
  const searchParams = await props.searchParams;
  const { orderId } = searchParams;
  if (!orderId) redirect("/");

  const order = await getOrder(orderId);
  if (!order) redirect("/");

  return (
    <div className="max-w-4xl mx-auto p-10">
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-green-800 mb-4">
          Order Placed Successfully!
        </h1>
        <p className="text-green-700 mb-8">
          Thank you for your purchase. Your order number is{" "}
          <span className="font-semibold">{order.orderNumber}</span>.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/orders"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
          >
            View Orders
          </Link>
          <Link
            href="/"
            className="bg-white text-green-600 border border-green-600 px-6 py-2 rounded hover:bg-green-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
