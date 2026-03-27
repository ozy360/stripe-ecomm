import CheckoutClient from "./checkoutclient";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

export default async function CheckoutPage(props: {
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const searchParams = await props.searchParams;
  const cancelled = searchParams.cancelled === "true";

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      {cancelled && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center">
          <strong className="font-bold">Order Cancelled!</strong>
          <span className="block sm:inline"> You have not been charged.</span>
        </div>
      )}
      <CheckoutClient />
      <Footer />
    </div>
  );
}
