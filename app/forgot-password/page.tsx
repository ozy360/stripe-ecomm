"use client";

import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { useActionState, useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { sendVerificationCodeAction, resetPasswordAction } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { CircleIcon, ArrowLeftIcon } from "@phosphor-icons/react";
const initialState = null;

function SendCodeButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <CircleIcon className="mr-2 h-5 w-5 animate-spin" />
          Sending code...
        </>
      ) : (
        "Send Verification Code"
      )}
    </Button>
  );
}

function ResetPasswordButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <CircleIcon className="mr-2 h-5 w-5 animate-spin" />
          Resetting password...
        </>
      ) : (
        "Reset Password"
      )}
    </Button>
  );
}

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  const [sendCodeState, sendCodeAction] = useActionState(
    sendVerificationCodeAction,
    initialState,
  );
  const [resetState, resetAction] = useActionState(
    resetPasswordAction,
    initialState,
  );

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft]);

  // Handle send code response
  useEffect(() => {
    if (sendCodeState && "error" in sendCodeState) {
      toast.error(sendCodeState.error, { duration: 4000 });
    } else if (sendCodeState && "success" in sendCodeState) {
      toast.success("Verification code sent to your email!", {
        duration: 4000,
      });
      setStep("reset");
      setTimeLeft(30);
    }
  }, [sendCodeState]);

  // Handle reset password response
  useEffect(() => {
    if (resetState && "error" in resetState) {
      toast.error(resetState.error, { duration: 4000 });
    } else if (resetState && "success" in resetState && resetState.redirect) {
      toast.success("Password reset successful! Redirecting to login...", {
        duration: 3000,
      });
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    }
  }, [resetState, router]);

  const handleResend = () => {
    const formData = new FormData();
    formData.append("email", email);
    sendCodeAction(formData);
  };

  return (
    <>
      <Toaster position="top-right" richColors />

      <div className="flex w-full items-center justify-center overflow-y-auto py-10 lg:min-h-screen">
        <Card className="w-full max-w-md !border-none bg-transparent">
          <CardHeader className="space-y-4">
            <Link
              href="/"
              className="mr-6 flex items-center space-x-2 text-white"
            >
              <span className="text-xl font-bold inline-block">
                {process.env.NEXT_PUBLIC_APP_NAME}
              </span>
            </Link>
            <div>
              <CardTitle className="text-2xl">
                {step === "email" ? "Forgot Password?" : "Reset Password"}
              </CardTitle>
              <CardDescription>
                {step === "email"
                  ? "Enter your email to receive a verification code"
                  : "Enter the code and your new password"}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {step === "email" ? (
              <form action={sendCodeAction} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Submit Button */}
                <SendCodeButton />

                {/* Back to Login */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={() => router.push("/login")}
                >
                  Back to Login
                </Button>
              </form>
            ) : (
              <form action={resetAction} className="space-y-4">
                {/* Hidden email field */}
                <input type="hidden" name="email" value={email} />

                {/* Verification Code */}
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    name="code"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                  />
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>

                {/* Submit Button */}
                <ResetPasswordButton />

                {/* Back to Email Step */}
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep("email")}
                >
                  <ArrowLeftIcon className="mr-2 h-5 w-5" />
                  Back
                </Button>

                <div className="text-center text-sm">
                  {timeLeft > 0 ? (
                    <span className="text-muted-foreground">
                      Resend code in {timeLeft}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-primary font-medium hover:underline"
                    >
                      Resend Verification Code
                    </button>
                  )}
                </div>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="text-primary font-medium hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
