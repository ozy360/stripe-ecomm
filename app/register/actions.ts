"use server";

import connectDB from "@/app/lib/mongodb";
import { User } from "../models/Schemas";
import bcrypt from "bcryptjs";

type RegisterState = { error: string } | { success: true };

export async function registerAction(
  _prevState: RegisterState | null,
  formData: FormData,
): Promise<RegisterState> {
  try {
    await connectDB();

    const fullname = String(formData.get("fullname") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    // Validation
    if (!fullname) return { error: "fullname is required" };
    if (!email) return { error: "Email is required" };

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return { error: "Please enter a valid email address" };
    }

    if (!password) return { error: "Password is required" };
    if (password.length < 8) {
      return { error: "Password must be at least 8 characters long" };
    }
    if (!confirmPassword) {
      return { error: "Please confirm your password" };
    }
    if (password !== confirmPassword) {
      return { error: "Passwords do not match" };
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "An account with this email already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullname,
      email,
      password: hashedPassword,
    });

    return { success: true };
  } catch (err: any) {
    console.error("Registration server action error:", err);

    if (err.code === 11000) {
      return { error: "An account with this email already exists" };
    }

    return { error: "Registration failed. Please try again." };
  }
}
