import mongoose, { Schema } from "mongoose";

// ============================================
// User Schema
// ============================================

const userSchema = new Schema(
  {
    forgotPasswordToken: {
      type: String,
      default: null
    },
    forgotPasswordTokenExpiry: {
      type: Date,
      default: null
    },
    fullname: { 
      type: String, 
      required: true, 
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: { 
      type: String, 
      required: true,
    },
    phone: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    // Shipping addresses
    shippingAddresses: [
      {
        label: { type: String },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        country: { type: String, required: true },
        isDefault: { type: Boolean, default: false }
      }
    ],
    preferences: {
      currency: { type: String, default: 'USD' },
      language: { type: String, default: 'en' }
    }
  },
  { 
    timestamps: true
  }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

// ============================================
// Product Schema
// ============================================

const productSchema = new Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    slug: {
      type: String,
      unique: true,
      trim: true
    },
    description: { 
      type: String, 
      required: true 
    },
    price: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    images: {
      type: [
        {
          url: String,
          deleteHash: String,
          _id: false 
        }
      ],
      default: []
    },
    category: {
      type: [String],
      trim: true
    },
    stock: { 
      type: Number, 
      required: true, 
      min: 0, 
      default: 0 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// ============================================
// Category Schema
// ============================================

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true
    },
    description: String,
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    }
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

// ============================================
// Order Schema
// ============================================

const orderSchema = new Schema(
  {
    orderNumber: { 
      type: String, 
      required: true, 
      unique: true 
    },
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    items: [
      {
        product: { 
          type: Schema.Types.ObjectId, 
          ref: 'Product', 
          required: true 
        },
        name: { 
          type: String, 
          required: true 
        },
        quantity: { 
          type: Number, 
          required: true, 
          min: 1 
        },
        price: { 
          type: Number, 
          required: true 
        }
      }
    ],
    total: { 
      type: Number, 
      required: true 
    },
    shippingAddress: {
      fullname: { type: String, required: true },
      email: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String, required: true }
    },
    status: { 
      type: String, 
      enum: ['pending', 'payment_received', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending' 
    },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'confirmed', 'failed'],
      default: 'pending' 
    },
    paymentId: {
      type: String
    }
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// ============================================
// Cart Schema
// ============================================

const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1
        }
      }
    ]
  },
  { timestamps: true }
);

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

// ============================================
// Export Models
// ============================================

export {
  User,
  Product,
  Order,
  Category,
  Cart,
};