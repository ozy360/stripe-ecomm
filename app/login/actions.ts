"use server";
import connectDB from "@/app/lib/mongodb";
import { User } from "../models/Schemas";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

type LoginState = { error: string } | { success: true };

export async function loginAction(
  _prevState: LoginState | null,
  formData: FormData,
): Promise<LoginState> {
  try {
    await connectDB();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      return { error: "Invalid email or password" };
    }

    const cookieStore = await cookies();

    // Hardcoded admin check
    if (email === "admin@admin.com" && password === "admin@admin.com") {
      cookieStore.delete("usersessionId");
      cookieStore.set("adminsessionId", "admin", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      redirect("/admin");
    }

    const getuser = await User.findOne({ email });
    if (!getuser) {
      // Note: generic error to avoid user enumeration
      return { error: "Invalid email or password" };
    }

    const isPasswordMatch = await bcrypt.compare(password, getuser.password);
    if (!isPasswordMatch) {
      return { error: "Invalid email or password" };
    }

    // Set user session
    cookieStore.delete("adminsessionId");
    cookieStore.set("usersessionId", String(getuser._id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    // Redirect based on role
    if (getuser.role === "admin") {
      redirect("/admin");
    }

    redirect("/");
  } catch (err: any) {
    if (err.message?.includes("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("Login server action error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}
