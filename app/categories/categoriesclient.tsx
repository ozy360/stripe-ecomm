"use client";

import Link from "next/link";
import { Category } from "@/app/types/models";

export default function CategoriesClient({
  categories,
}: {
  categories: Category[];
}) {
  return (
    <div className="flex-1">
      <div className="mx-auto max-w-7xl p-6 py-14 lg:py-20">
        <h1 className="mb-8 text-2xl font-bold md:text-3xl">
          Product Categories
        </h1>
        {categories.length === 0 ? (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center space-y-2">
            <p>No categories found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                href={`/products?category=${category.slug}`}
                key={category._id}
                className="group"
              >
                <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
                  <div className="flex h-[180px] items-center justify-center bg-muted/50 p-6">
                    <span className="text-4xl font-bold text-muted-foreground opacity-20 group-hover:opacity-40">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
