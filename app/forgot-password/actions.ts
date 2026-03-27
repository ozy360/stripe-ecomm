"use server";
import connectDB from "@/app/lib/mongodb";
import { User } from "../models/Schemas";
import bcrypt from "bcryptjs";
// import { EmailTemplate } from '@/components/email-template';
// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

type ForgotPasswordState = { error: string } | { success: true };
type ResetPasswordState =
  | { error: string }
  | { success: true; redirect: boolean };

// Generate a random 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Step 1: Send verification code to email
 */
export async function sendVerificationCodeAction(
  _prevState: ForgotPasswordState | null,
  formData: FormData,
): Promise<ForgotPasswordState> {
  try {
    await connectDB();

    const email = String(formData.get("email") || "").trim();

    // Validation
    if (!email) {
      return { error: "Email is required" };
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return { error: "Please enter a valid email address" };
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists or not for security
      return {
        error: "If this email exists, a verification code has been sent",
      };
    }

    const code = generateCode();
    const expires = new Date(Date.now() + 30 * 60 * 1000);

    user.forgotPasswordToken = code;
    user.forgotPasswordTokenExpiry = expires;
    await user.save();

    console.log(`Verification code for ${email}: ${code}`);

    //   const { data, error } = await resend.emails.send({

    //   from: 'onboarding@resend.dev',

    //   to: 'delivered@resend.dev',

    //   subject: 'Hello world',

    //   react: EmailTemplate({ firstName: 'John' }),

    // });

    // if (error) {

    //   return Response.json({ error });

    // }

    return { success: true };
  } catch (err: any) {
    console.error("Send verification code error:", err);
    return { error: "Failed to send verification code. Please try again." };
  }
}

/**
 * Step 2: Verify code and reset password
 */
export async function resetPasswordAction(
  _prevState: ResetPasswordState | null,
  formData: FormData,
): Promise<ResetPasswordState> {
  try {
    await connectDB();

    const email = String(formData.get("email") || "").trim();
    const code = String(formData.get("code") || "").trim();
    const newPassword = String(formData.get("newPassword") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    // Validation
    if (!email) {
      return { error: "Email is required" };
    }

    if (!code) {
      return { error: "Verification code is required" };
    }

    if (!newPassword) {
      return { error: "New password is required" };
    }

    if (newPassword.length < 8) {
      return { error: "Password must be at least 8 characters long" };
    }

    if (!confirmPassword) {
      return { error: "Please confirm your password" };
    }

    if (newPassword !== confirmPassword) {
      return { error: "Passwords do not match" };
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return { error: "User not found" };
    }

    // Verify code from database
    if (!user.forgotPasswordToken || user.forgotPasswordToken !== code) {
      return { error: "Invalid verification code" };
    }

    if (
      !user.forgotPasswordTokenExpiry ||
      new Date() > user.forgotPasswordTokenExpiry
    ) {
      return {
        error: "Verification code has expired. Please request a new one.",
      };
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    user.forgotPasswordToken = null;
    user.forgotPasswordTokenExpiry = null;
    await user.save();

    return { success: true, redirect: true };
  } catch (err: any) {
    console.error("Reset password error:", err);
    return { error: "Failed to reset password. Please try again." };
  }
}
