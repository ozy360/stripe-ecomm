import Nav from "@/components/nav";
import Hero from "@/components/home/hero";
import ProductsOne from "@/components/home/products";
import ProductsTwo from "@/components/home/productstwo";
import Footer from "@/components/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "LuxeComm";
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex flex-1 flex-col">
        <Hero />

        <ProductsOne />

        <div
          className="flex h-[80vh] w-full items-center justify-center bg-cover bg-top bg-no-repeat"
          style={{ backgroundImage: 'url("/secondhalf.jpeg")' }}
        ></div>

        <ProductsTwo />
        <section className="bg-card flex h-[500px] w-full flex-col items-center justify-center gap-8 overflow-hidden">
          <div className="font-italic text-3xl">{brandName}</div>
          <Button asChild className="rounded-full px-8">
            <Link href="/products">Shop Collection</Link>
          </Button>
        </section>
      </main>

      <Footer />
    </div>
  );
}
