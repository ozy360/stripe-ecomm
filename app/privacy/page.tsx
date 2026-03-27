"use client";

import Link from "next/link";
import { CaretLeftIcon } from "@phosphor-icons/react";
import Footer from "@/components/footer";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-20 flex-grow max-w-4xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:transition-colors"
          >
            <CaretLeftIcon className="mr-2 h-4 w-4" />
            Back to Store
          </Link>
        </div>

        <main className="prose prose-gray max-w-none">
          <h1 className="text-3xl font-bold mb-6 text-foreground">
            Privacy Policy
          </h1>
          <p className="text-gray-600 mb-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                1. Information Collection
              </h2>
              <p>
                We collect information you provide directly to us. For example,
                we collect information when you create an account, subscribe,
                participate in any interactive features of our services, fill
                out a form, request customer support or otherwise communicate
                with us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                2. Use of Information
              </h2>
              <p>
                We use the information we collect to provide, maintain, and
                improve our services, such as to administer your account, to
                send you technical notices, updates, security alerts and support
                and administrative messages.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                3. Sharing of Information
              </h2>
              <p>
                We may share information about you as follows or as otherwise
                described in this Privacy Policy: With vendors, consultants and
                other service providers who need access to such information to
                carry out work on our behalf.
              </p>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
