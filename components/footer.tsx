"use client";
import Link from "next/link";
import {
  FacebookLogoIcon,
  InstagramLogoIcon,
  TwitterLogoIcon,
} from "@phosphor-icons/react";

export default function Footer() {
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "LuxeComm";
  return (
    <>
      <footer className="bg-background border-t py-12 text-sm">
        <div className="flex flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-6">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Link href="/" className="text-xl font-bold">
              {brandName}
            </Link>
            <p className="text-muted-foreground">
              &copy; {new Date().getFullYear()} {brandName}. All rights
              reserved.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 md:items-end">
            <nav className="text-muted-foreground flex gap-6 font-medium">
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/about"
                className="hover:text-foreground transition-colors"
              >
                About
              </Link>
            </nav>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <FacebookLogoIcon className="size-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <InstagramLogoIcon className="size-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <TwitterLogoIcon className="size-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
