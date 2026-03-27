"use client";
import { useFormStatus } from "react-dom";
import { useActionState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { loginAction } from "./actions";
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

const initialState = null;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <CircleNotchIcon className="mr-2 h-5 w-5 animate-spin" />}
      Sign In
    </Button>
  );
}

export default function Login() {
  const [state, formAction] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state && "error" in state) {
      toast.error(state.error, { duration: 4000 });
    }
  }, [state]);

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="flex lg:min-h-screen w-full items-center justify-center overflow-y-auto py-10">
        <Card className="w-full max-w-md bg-transparent border-none">
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
              <CardTitle className="text-2xl">Hello there!</CardTitle>
              <CardDescription>Sign in to continue</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </div>
              <SubmitButton />
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </form>
            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">
                OR
              </span>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-primary hover:underline"
              >
                Create Account
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
