"use client";

import Image from "next/image";
import { useFormStatus } from "react-dom";
import { useActionState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import Link from "next/link";
import { registerAction } from "./actions";

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
import { Separator } from "@/components/ui/separator";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

const initialState = null;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <CircleNotchIcon className="mr-2 h-5 w-5 animate-spin" />
          Signing up...
        </>
      ) : (
        "Sign Up"
      )}
    </Button>
  );
}

export default function Signup() {
  const router = useRouter();
  const [state, formAction] = useActionState(registerAction, initialState);

  useEffect(() => {
    if (state && "error" in state) {
      toast.error(state.error, { duration: 4000 });
    } else if (state && "success" in state) {
      router.push("/login");
    }
  }, [state, router]);

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="flex lg:min-h-screen w-full items-center justify-center overflow-y-auto py-10">
        <Card className="w-full max-w-md bg-transparent !border-none">
          <CardHeader className="space-y-4">
            <Link href="/">
              <Image
                src="/logo.png"
                width={60}
                height={60}
                alt="logo"
                className="mb-2"
              />
            </Link>
            <div>
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>Sign up to get started</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form action={formAction} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="username">Fullname</Label>
                <Input
                  id="fullname"
                  type="text"
                  name="fullname"
                  placeholder="Enter your fullname"
                  autoComplete="name"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>

              {/* Submit Button */}
              <SubmitButton />
            </form>

            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">
                OR
              </span>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign In
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
