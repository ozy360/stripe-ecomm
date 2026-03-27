import { getUserOrders } from "@/components/actions";
import OrdersClient from "./ordersclient";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

export default async function Orders() {
  const orders = await getUserOrders();
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <OrdersClient orders={orders} />
      <Footer />
    </div>
  );
}
