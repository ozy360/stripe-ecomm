import { notFound } from "next/navigation";
import { getAllProducts, getProductBySlug } from "../actions";
import { Badge } from "@/components/ui/badge";
import AddToCartButton from "@/components/add-to-cart-button";
import Nav from "@/components/nav";
import ProductImageGallery from "@/components/product-image-gallery";
import SwiperCarouselClient from "@/components/caurosel";
import Footer from "@/components/footer";

export default async function SingleProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const allProducts = await getAllProducts();

  const relatedProducts = allProducts.filter((p: any) => {
    return (
      p.category.some((cat: string) => product.category.includes(cat)) &&
      p._id !== product._id
    );
  });

  const isNew =
    new Date(product.createdAt ?? 0).getTime() >
    Date.now() - 14 * 24 * 60 * 60 * 1000;

  return (
    <>
      <Nav />
      <div className="mb-30 md:container md:mx-auto md:my-30 md:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <ProductImageGallery
            images={product.images || []}
            name={product.name}
          />

          <div className="flex flex-col justify-center space-y-6 px-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight uppercase md:text-4xl">
                {product.name}
              </h1>
              <div className="mt-4 text-2xl font-medium">
                ${product.price.toFixed(2)}
              </div>
            </div>

            <div className="text-muted-foreground prose max-w-none">
              <p>{product.description}</p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <AddToCartButton product={product} />
            </div>

            <div className="text-muted-foreground border-t pt-6 text-sm">
              <p>
                Category:{" "}
                <span className="text-foreground font-medium capitalize">
                  {product.category || "undefined"}
                </span>
              </p>
              <p>
                Stock:{" "}
                <span className="text-foreground font-medium">
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="mb-6 text-2xl font-bold">Related Products</h2>
            <SwiperCarouselClient items={relatedProducts} />
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
