"use server";

import connectDB from "@/app/lib/mongodb";
import { Product } from "@/app/models/Schemas";

export async function getAllProducts() {
  try {
    await connectDB();
    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();
    return products.map((product: any) => ({
      _id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      images: product.images || [],
      category: product.category,
      stock: product.stock,
      isActive: product.isActive,
      slug: product.slug,
      createdAt: product.createdAt?.toISOString(),
      updatedAt: product.updatedAt?.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    await connectDB();
    const product = await Product.findOne({ slug, isActive: true }).lean();
    if (!product) return null;
    return {
      _id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      images: product.images || [],
      category: product.category,
      stock: product.stock,
      isActive: product.isActive,
      slug: product.slug,
      createdAt: product.createdAt?.toISOString(),
      updatedAt: product.updatedAt?.toISOString(),
    };
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}
