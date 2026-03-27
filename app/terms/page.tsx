"use client";

import Link from "next/link";
import { CaretLeftIcon } from "@phosphor-icons/react";
import Footer from "@/components/footer";

export default function Terms() {
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
            Terms of Service
          </h1>
          <p className="text-gray-600 mb-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">
                1. Introduction
              </h2>
              <p>
                Welcome to Ecomm Store. By accessing our website, you agree to
                be bound by these Terms of Service, all applicable laws and
                regulations, and agree that you are responsible for compliance
                with any applicable local laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">
                2. Use License
              </h2>
              <p>
                Permission is granted to temporarily download one copy of the
                materials (information or software) on Ecomm Store's website for
                personal, non-commercial transitory viewing only.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">
                3. Disclaimer
              </h2>
              <p>
                The materials on Ecomm Store's website are provided on an 'as
                is' basis. Ecomm Store makes no warranties, expressed or
                implied, and hereby disclaim and negate all other warranties
                including, without limitation, implied warranties or conditions
                of merchantability, fitness for a particular purpose, or
                non-infringement of intellectual property or other violation of
                rights.
              </p>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
