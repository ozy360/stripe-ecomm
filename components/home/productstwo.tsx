import SwiperCarouselClient from "../caurosel";

export default async function ProductsTwo() {
  let products = [];

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/products?isActive=true`,
      {
        cache: "no-store",
      },
    );

    if (!res.ok) throw new Error("Failed to fetch products");

    const data = await res.json();
    if (Array.isArray(data)) {
      products = data;
    } else if (data.products) {
      products = data.products;
    }
  } catch (error) {
    console.error("Failed to fetch products", error);
  }

  return (
    products &&
    products.length > 5 && (
      <SwiperCarouselClient items={products.splice(5, 10)} />
    )
  );
}
