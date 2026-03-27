"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SwiperCarouselClient({ items: products }: any) {
  function isNewProduct(createdAt: string, days = 14): boolean {
    const createdDate = new Date(createdAt);
    const now = new Date();

    const diffInMs = now.getTime() - createdDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    return diffInDays <= days;
  }

  const productsWithNewFlag = products.map((products: any) => ({
    ...products,
    isNew: isNewProduct(products.created_at, 14),
  }));

  return (
    <div className="p-6 md:p-[100px]">
      <Swiper
        breakpoints={{
          0: { slidesPerView: 1.2, spaceBetween: 8 },
          640: { slidesPerView: 2.2, spaceBetween: 12 },
          768: { slidesPerView: 2.5, spaceBetween: 16 },
          1024: { slidesPerView: 3.2, spaceBetween: 20 },
        }}
      >
        {productsWithNewFlag.map((item: any, index: number) => (
          <SwiperSlide key={index}>
            <Link href={`/products/${item.slug}`}>
              <Card className="flex h-[360px] w-full flex-col">
                <CardContent className="flex h-full flex-col p-0">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-[14px] font-medium uppercase">
                      {item.isNew && <Badge variant="secondary">New</Badge>}
                    </div>
                    {/* <LikeIcon /> */}
                    <div></div>
                  </div>
                  <div className="mb-4 flex flex-1 items-center justify-center overflow-hidden">
                    {(item.images?.[0]?.url || item.image) && (
                      <img
                        src={item.images?.[0]?.url || item.image}
                        alt={item.name}
                        className="size-[60%] object-contain"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>

            <div className="products-center mt-[10px] flex justify-between px-[10px] text-[14px] md:text-base">
              <div className="truncate uppercase">{item.name}</div>
              <div className="pl-20 font-medium">${item.price?.toFixed(2)}</div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
