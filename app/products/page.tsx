import Link from 'next/link';
import { getCategories, getProducts } from '@/components/admin/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FunnelIcon } from '@phosphor-icons/react/dist/ssr';
import Nav from '@/components/nav';
import Footer from '@/components/footer';

export default async function Products({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const categoriesData = await getCategories();
  const productsData = await getProducts();

  const categories = ['All', ...categoriesData.map((c: any) => c.name)];
  const activeCategory =
    typeof searchParams?.category === 'string' ? searchParams.category : 'All';

  let filteredProducts = productsData;
  if (activeCategory !== 'All') {
    filteredProducts = productsData.filter((product: any) =>
      product.category.includes(activeCategory),
    );
  }

  const productsWithNewFlag = filteredProducts.map((product: any) => ({
    ...product,
    isNew:
      new Date(product.createdAt).getTime() >
      Date.now() - 14 * 24 * 60 * 60 * 1000,
  }));

  return (
    <>
      <Nav />
      <div className="container mx-auto px-4 py-10 md:px-6">
        <div className="pb-[33px]">
          <div className="">
            {/* <div className="font-display text-[22px] capitalize">
            {activeCategory}
          </div> */}
            <div className="mb-[16px] flex items-center gap-y-[24px]">
              <FunnelIcon size={20} />
              <span className="ml-2 font-medium uppercase">Filters</span>
            </div>
          </div>
          <div className="scrollbar-hide flex items-center gap-x-[8px] md:pl-0">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={
                  category === 'All'
                    ? '/products'
                    : `/products?category=${category}`
                }
                className={`cursor-pointer rounded-full border px-[12px] py-[6px] font-medium capitalize ${
                  activeCategory === category
                    ? 'border-[#121212] bg-[#121212] text-white'
                    : 'border-[#8E8E93] text-[#8E8E93]'
                }`}
              >
                {String(category)}
              </Link>
            ))}
          </div>
        </div>
        <div className="pb-[50px]">
          <div className="grid grid-cols-1 gap-x-[10px] gap-y-[24px] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {productsWithNewFlag?.map((product: any) => (
              <div key={product._id || product.id}>
                <Link
                  href={`/products/${product.slug || product._id}`}
                  className="text-inherit no-underline"
                >
                  <Card className="relative flex h-[300px] w-full flex-col overflow-hidden rounded-[10px] border-none p-0">
                    <CardContent className="flex h-full flex-col p-[10px]">
                      {product.isNew && (
                        <Badge
                          variant="secondary"
                          className="absolute top-3 left-3 z-10 bg-white text-black hover:bg-white/90"
                        >
                          New
                        </Badge>
                      )}
                      <div className="flex flex-1 items-center justify-center overflow-hidden">
                        {(product.images?.[0]?.url || product.image) && (
                          <img
                            src={product.images?.[0]?.url || product.image}
                            alt={product.name}
                            className="size-[60%] object-contain"
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <div className="mt-[10px] flex items-center justify-between px-[7.5px] text-[14px] md:text-base">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium uppercase">
                      {product.name}
                    </p>
                  </div>
                  <div className="flex-shrink-0 pl-2 font-medium">
                    ${product.price.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
