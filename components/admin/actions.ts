"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import connectDB from "@/app/lib/mongodb";
import { Product, Order, User, Category } from "@/app/models/Schemas";
// @ts-expect-error: imgur types are not correctly exported
import { ImgurClient } from "imgur";
import type {
  User as UserType,
  Product as ProductType,
  ProductFilters,
  ProductResponse,
  Order as OrderType,
  OrderFilters,
  LeanProduct,
  LeanUser,
  LeanOrder,
} from "@/app/types/models";

// Helper to verify admin privileges
async function checkAdmin() {
  const cookieStore = await cookies();
  const adminSessionId = cookieStore.get("adminsessionId")?.value;
  if (adminSessionId === "admin") {
    return; // Hardcoded admin is logged in
  }

  const userId = cookieStore.get("usersessionId")?.value;
  if (!userId) throw new Error("Unauthorized");

  await connectDB();
  const user = await User.findById(userId);
  // if (!user || user.role !== "admin") throw new Error("Unauthorized access");
}

// ============================================
// Product Management Actions
// ============================================

export async function getProducts(
  filters: ProductFilters = {},
): Promise<ProductType[]> {
  try {
    await connectDB();
    // Note: getProducts might be public, so checkAdmin() is optional here depending on requirements

    const query: any = {};

    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .lean<LeanProduct[]>();

    // Convert to plain Product type with string IDs
    return products.map((p) => ({
      _id: p._id.toString(),
      name: p.name,
      description: p.description,
      price: p.price,
      images: p.images || [],
      category: p.category,
      stock: p.stock,
      isActive: p.isActive,
      slug: p.slug,
      createdAt: p.createdAt?.toISOString(),
      updatedAt: p.updatedAt?.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProduct(id: string): Promise<ProductType | null> {
  try {
    await connectDB();
    const product = await Product.findById(id).lean<LeanProduct>();

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
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function createProduct(
  formData: FormData,
): Promise<ProductResponse> {
  try {
    await checkAdmin();
    // This action is now just a wrapper - actual creation happens in API route
    // because FormData with files needs to be handled by the API route
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/products`,
      {
        method: "POST",
        body: formData,
      },
    );

    const result = await response.json();

    if (result.success) {
      // Revalidate the products page
      revalidatePath("/products");
      revalidatePath("/");
      revalidatePath("/admin/products");
    }

    return result;
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function updateProduct(
  id: string,
  formData: FormData,
): Promise<ProductResponse> {
  try {
    await checkAdmin();
    // This action is now just a wrapper - actual update happens in API route
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/products/${id}`,
      {
        method: "PUT",
        body: formData,
      },
    );

    const result = await response.json();

    if (result.success) {
      // Revalidate the products page
      revalidatePath("/products");
      revalidatePath(`/products/${id}`);
      revalidatePath("/");
      revalidatePath("/admin/products");
    }

    return result;
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function deleteProduct(id: string): Promise<ApiResponse> {
  try {
    await checkAdmin();
    await connectDB();

    const product = await Product.findById(id);

    if (!product) {
      throw new Error("Product not found");
    }

    // Delete images from Imgur
    if (
      product.images?.length > 0 &&
      process.env.CLIENT_ID &&
      process.env.CLIENT_SECRET
    ) {
      const client = new ImgurClient({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
      });

      for (const image of product.images) {
        if (image.deleteHash) {
          await client
            .deleteImage(image.deleteHash)
            .catch((err: any) =>
              console.error("Error deleting image from Imgur:", err),
            );
        }
      }
    }

    await Product.findByIdAndDelete(id);

    // Revalidate the products page
    revalidatePath("/products");
    revalidatePath("/");
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function toggleProductStatus(
  id: string,
  isActive: boolean,
): Promise<ProductResponse> {
  try {
    await checkAdmin();
    await connectDB();

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { isActive: !isActive },
      { new: true },
    ).lean<LeanProduct>();

    if (!updatedProduct) {
      throw new Error("Product not found");
    }

    const product: ProductType = {
      _id: updatedProduct._id.toString(),
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      images: updatedProduct.images || [],
      category: updatedProduct.category,
      stock: updatedProduct.stock,
      isActive: updatedProduct.isActive,
      slug: updatedProduct.slug,
      createdAt: updatedProduct.createdAt?.toISOString(),
      updatedAt: updatedProduct.updatedAt?.toISOString(),
    };

    // Revalidate the products page
    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    revalidatePath("/");
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product status updated successfully",
      product,
    };
  } catch (error) {
    console.error("Error toggling product status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function searchProducts(query: string): Promise<ProductType[]> {
  return getProducts({ search: query });
}

export async function getProductsByCategory(
  category: string,
): Promise<ProductType[]> {
  return getProducts({ category });
}

export async function getActiveProducts(): Promise<ProductType[]> {
  return getProducts({ isActive: true });
}

export async function getLowStockProducts(
  threshold: number = 10,
): Promise<ProductType[]> {
  try {
    const allProducts = await getProducts();
    return allProducts.filter((product) => product.stock <= threshold);
  } catch (error) {
    console.error("Error getting low stock products:", error);
    return [];
  }
}

// ============================================
// Category Management Actions
// ============================================

export interface CategoryStats {
  _id: string;
  name: string;
  slug?: string;
  count: number;
  activeCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  category?: any;
}

/**
 * Get all categories with product counts
 */
export async function getCategories(): Promise<CategoryStats[]> {
  try {
    await checkAdmin();
    await connectDB();

    // Get all categories from Category collection
    const categories = await Category.find({}).sort({ name: 1 }).lean();

    // Get product counts for each category
    const productStats = await Product.aggregate([
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          activeCount: { $sum: { $cond: ["$isActive", 1, 0] } },
        },
      },
    ]);

    // Create a map of category name to stats
    const statsMap = new Map(
      productStats.map((stat) => [
        stat._id,
        { count: stat.count, activeCount: stat.activeCount },
      ]),
    );

    // Combine categories with their stats
    const categoriesWithStats: CategoryStats[] = categories.map((cat) => {
      const stats = statsMap.get(cat.name) || { count: 0, activeCount: 0 };
      return {
        _id: cat._id.toString(),
        name: cat.name,
        slug: cat.slug,
        count: stats.count,
        activeCount: stats.activeCount,
        createdAt: cat.createdAt?.toISOString(),
        updatedAt: cat.updatedAt?.toISOString(),
      };
    });

    return categoriesWithStats;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

/**
 * Create a new category
 */
export async function createCategory(name: string): Promise<ApiResponse> {
  try {
    await checkAdmin();
    await connectDB();
    // Validate input
    if (!name || name.trim().length === 0) {
      return {
        success: false,
        error: "Category name is required",
      };
    }

    const trimmedName = name.trim();

    // Check if category already exists
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
    });

    if (existingCategory) {
      return {
        success: false,
        error: "Category already exists",
      };
    }

    // Create new category
    const category = new Category({
      name: trimmedName,
      slug: trimmedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, ""),
    });

    const savedCategory = await category.save();

    // Convert to plain object
    const plainCategory = {
      _id: savedCategory._id.toString(),
      name: savedCategory.name,
      slug: savedCategory.slug,
      createdAt: savedCategory.createdAt?.toISOString(),
      updatedAt: savedCategory.updatedAt?.toISOString(),
    };

    // Revalidate paths
    revalidatePath("/products");
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Category created successfully",
    };
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete a category (optional - useful for management)
 */
export async function deleteCategory(categoryId: string): Promise<ApiResponse> {
  try {
    await checkAdmin();
    await connectDB();

    const category = await Category.findById(categoryId);

    if (!category) {
      return {
        success: false,
        error: "Category not found",
      };
    }

    // Check if any products are using this category
    const productsUsingCategory = await Product.countDocuments({
      category: category.name,
    });

    if (productsUsingCategory > 0) {
      return {
        success: false,
        error: `Cannot delete category. ${productsUsingCategory} product(s) are using this category.`,
      };
    }

    await Category.findByIdAndDelete(categoryId);

    // Revalidate paths
    revalidatePath("/products");
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Category deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Update a category name (optional)
 */
export async function updateCategory(
  categoryId: string,
  newName: string,
): Promise<ApiResponse> {
  try {
    await checkAdmin();
    await connectDB();

    if (!newName || newName.trim().length === 0) {
      return {
        success: false,
        error: "Category name is required",
      };
    }

    const trimmedName = newName.trim();

    // Find the category
    const category = await Category.findById(categoryId);

    if (!category) {
      return {
        success: false,
        error: "Category not found",
      };
    }

    const oldName = category.name;

    // Check if new name already exists
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
      _id: { $ne: categoryId },
    });

    if (existingCategory) {
      return {
        success: false,
        error: "Category name already exists",
      };
    }

    // Update category name
    category.name = trimmedName;
    category.slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    await category.save();

    // Update all products using this category
    await Product.updateMany(
      { category: oldName },
      { $set: { "category.$[elem]": trimmedName } },
      { arrayFilters: [{ elem: oldName }] },
    );

    // Revalidate paths
    revalidatePath("/products");
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Category updated successfully",
    };
  } catch (error) {
    console.error("Error updating category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// ============================================
// User Management Actions
// ============================================

export async function getUsers(): Promise<UserType[]> {
  try {
    await checkAdmin();
    await connectDB();
    const users = await User.find().sort({ createdAt: -1 }).lean<LeanUser[]>();

    return users.map((user) => ({
      _id: user._id.toString(),
      fullname: user.fullname,
      email: user.email,
      password: user.password,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function getUser(id: string): Promise<UserType | null> {
  try {
    await checkAdmin();
    await connectDB();
    const user = await User.findById(id).lean<LeanUser>();
    if (!user) return null;

    return {
      _id: user._id.toString(),
      fullname: user.fullname,
      email: user.email,
      password: user.password,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function updateUser(
  id: string,
  userData: Partial<UserType>,
): Promise<ApiResponse> {
  try {
    await checkAdmin();
    await connectDB();
    await User.findByIdAndUpdate(id, userData);

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}`);

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function searchUsers(query: string): Promise<UserType[]> {
  try {
    await checkAdmin();
    const users = await getUsers();
    const lowerQuery = query.toLowerCase();
    return users.filter(
      (user) =>
        user.fullname.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery),
    );
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
}

// ============================================
// Product Validation
// ============================================

export async function validateProductData(formData: FormData): Promise<{
  isValid: boolean;
  errors: string[];
  data: Partial<ProductType>;
}> {
  const errors: string[] = [];
  const data: Partial<ProductType> = {};

  // Name validation
  const name = formData.get("name") as string;
  if (!name || name.trim().length === 0) {
    errors.push("Product name is required");
  } else if (name.length > 100) {
    errors.push("Product name must be less than 100 characters");
  } else {
    data.name = name.trim();
  }

  // Description validation
  const description = formData.get("description") as string;
  if (!description || description.trim().length === 0) {
    errors.push("Product description is required");
  } else if (description.length > 1000) {
    errors.push("Product description must be less than 1000 characters");
  } else {
    data.description = description.trim();
  }

  // Price validation
  const priceStr = formData.get("price") as string;
  const price = parseFloat(priceStr);
  if (!priceStr || isNaN(price)) {
    errors.push("Valid price is required");
  } else if (price < 0) {
    errors.push("Price must be a positive number");
  } else if (price > 1000000) {
    errors.push("Price must be less than 1,000,000");
  } else {
    data.price = price;
  }

  // Stock validation
  const stockStr = formData.get("stock") as string;
  const stock = parseInt(stockStr);
  if (stockStr) {
    if (isNaN(stock)) {
      errors.push("Stock must be a valid number");
    } else if (stock < 0) {
      errors.push("Stock must be a positive number");
    } else {
      data.stock = stock;
    }
  }

  // Category validation
  const categoryStr = formData.get("category") as string;
  if (categoryStr) {
    const categories = categoryStr
      .split(",")
      .map((cat) => cat.trim())
      .filter((cat) => cat.length > 0);
    if (categories.length > 0) {
      data.category = categories;
    }
  }

  // IsActive validation
  const isActiveStr = formData.get("isActive") as string;
  if (isActiveStr) {
    data.isActive = isActiveStr === "true";
  }

  return {
    isValid: errors.length === 0,
    errors,
    data,
  };
}

// ============================================
// Order Management Actions
// ============================================

export async function getOrders(
  filters: OrderFilters = {},
): Promise<OrderType[]> {
  try {
    await checkAdmin();
    await connectDB();
    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
    if (filters.userId) query.user = filters.userId;
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        const startDate =
          typeof filters.startDate === "string"
            ? new Date(filters.startDate)
            : filters.startDate;
        query.createdAt.$gte = startDate;
      }
      if (filters.endDate) {
        const endDate =
          typeof filters.endDate === "string"
            ? new Date(filters.endDate)
            : filters.endDate;
        query.createdAt.$lte = endDate;
      }
    }

    const orders = await Order.find(query)
      .populate("user", "fullname email createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean<LeanOrder[]>();

    return orders.map((order) => ({
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      user: order.user
        ? {
            _id: (order.user as any)._id.toString(),
            fullname: (order.user as any).fullname,
            email: (order.user as any).email,
            password: "", // Don't expose password
            createdAt: (order.user as any).createdAt,
            updatedAt: (order.user as any).updatedAt,
          }
        : (undefined as any),
      items: (order.items || []).map((item) => ({
        product: item.product
          ? typeof item.product === "string"
            ? item.product
            : item.product.toString()
          : "",
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: order.total,
      paymentId: order.paymentId,
      shippingAddress: order.shippingAddress,
      status: order.status,
      paymentStatus: order.paymentStatus,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export async function getOrder(id: string): Promise<OrderType | null> {
  try {
    await checkAdmin();
    await connectDB();
    const order = await Order.findById(id)
      .populate("user", "fullname email createdAt updatedAt")
      .lean<LeanOrder>();
    if (!order) return null;

    return {
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      user: order.user
        ? {
            _id: (order.user as any)._id.toString(),
            fullname: (order.user as any).fullname,
            email: (order.user as any).email,
            password: "", // Don't expose password
            createdAt: (order.user as any).createdAt,
            updatedAt: (order.user as any).updatedAt,
          }
        : (undefined as any),
      items: (order.items || []).map((item) => ({
        product: item.product
          ? typeof item.product === "string"
            ? item.product
            : item.product.toString()
          : "",
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: order.total,
      paymentId: order.paymentId,
      shippingAddress: order.shippingAddress,
      status: order.status,
      paymentStatus: order.paymentStatus,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

export async function updateOrderStatus(
  id: string,
  status: OrderType["status"],
): Promise<ApiResponse> {
  try {
    await checkAdmin();
    await connectDB();
    await Order.findByIdAndUpdate(id, { status });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);

    return {
      success: true,
      message: "Order status updated successfully",
    };
  } catch (error) {
    console.error("Error updating order status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function updateOrderPaymentStatus(
  id: string,
  paymentStatus: OrderType["paymentStatus"],
): Promise<ApiResponse> {
  try {
    await checkAdmin();
    await connectDB();
    await Order.findByIdAndUpdate(id, { paymentStatus });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);

    return {
      success: true,
      message: "Payment status updated successfully",
    };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
