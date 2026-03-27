// Base MongoDB Document interface
export interface MongoDBDocument {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================
// User Types
// ============================================
export interface User extends MongoDBDocument {
  fullname: string;
  email: string;
  password: string;
  isActive: boolean;
  emailVerified?: boolean;
  phone?: string;
  role: "user" | "admin";
}

// ============================================
// Product Types
// ============================================
export interface Product {
  _id: string;
  id?: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  images?: Array<{ url: string; deleteHash: string }>; // Matches model
  category: string[]; // Matches model
  stock: number;
  isActive: boolean;
  createdAt?: string | Date; // Can be either
  updatedAt?: string | Date; // Can be either
}

// ============================================
// Category Types
// ============================================
export interface Category extends MongoDBDocument {
  name: string;
  slug?: string;
  description?: string;
  parent?: string | Category;
}

// ============================================
// Order Types
// ============================================
export interface OrderItem {
  product: string | Product; // Can be ObjectId string or populated Product
  name: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface Order extends MongoDBDocument {
  orderNumber: string;
  user: string | User; // Can be ObjectId string or populated User
  items: OrderItem[];
  total: number;
  shippingAddress: ShippingAddress;
  status:
    | "pending"
    | "payment_received"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentStatus: "pending" | "confirmed" | "failed";
  paymentId?: string;
  notes?: string;
}

// ============================================
// Image Types
// ============================================
export interface Image extends MongoDBDocument {
  name: string;
  image: string;
  deletehash: string; // lowercase 'h' to match model
}

// ============================================
// Filter Types
// ============================================
export interface ProductFilters {
  category?: string;
  isActive?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface OrderFilters {
  status?: Order["status"]; // Use the actual type
  paymentStatus?: Order["paymentStatus"]; // Use the actual type
  userId?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  page?: number;
  limit?: number;
}

// ============================================
// Response Types
// ============================================
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ProductResponse extends ApiResponse {
  product?: Product;
}

export interface ProductsResponse extends ApiResponse {
  products?: Product[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UsersResponse extends ApiResponse {
  users?: User[];
}

export interface OrdersResponse extends ApiResponse {
  orders?: Order[];
}

export interface ImagesResponse extends ApiResponse {
  images?: Image[];
}

export interface CategoriesResponse extends ApiResponse {
  categories?: Array<{
    name: string;
    count: number;
    activeCount: number;
  }>;
}

// ============================================
// Form Data Types
// ============================================
export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  images?: File[]; // Changed to array
  category?: string[];
  stock?: number;
  isActive?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export interface CreateUserData {
  fullname: string;
  email: string;
  password: string;
  walletAddress?: string;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  id: string;
}

// ============================================
// Dashboard Types
// ============================================
export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalUsers: number;
  newUsersThisMonth: number;
  lowStockProducts: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export interface AnalyticsData {
  period: string;
  sales: SalesData[];
  topProducts: Array<{
    product: Product;
    quantity: number;
    revenue: number;
  }>;
  topCategories: Array<{
    category: string;
    revenue: number;
    orders: number;
  }>;
}

export interface Activity {
  _id: string;
  type:
    | "product_created"
    | "product_updated"
    | "order_placed"
    | "user_registered"
    | "status_changed";
  description: string;
  user?: User;
  metadata?: any;
  createdAt: Date;
}

// ============================================
// Server Action Specific Types
// ============================================

// For lean() queries which return plain objects
export interface LeanProduct {
  _id: any; // ObjectId before .toString()
  name: string;
  slug?: string;
  description: string;
  price: number;
  images?: Array<{ url: string; deleteHash: string }>;
  category: string[];
  stock: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LeanUser {
  _id: any; // ObjectId before .toString()
  fullname: string;
  email: string;
  password: string;
  role: "user" | "admin";
  isActive: boolean;
  emailVerified?: boolean;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LeanOrder {
  _id: any;
  orderNumber: string;
  user: any;
  items: Array<{
    product: any;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  shippingAddress: ShippingAddress;
  status: Order["status"];
  paymentStatus: Order["paymentStatus"];
  paymentId?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
