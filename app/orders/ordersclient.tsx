"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PackageIcon } from "@phosphor-icons/react";
import { Order as OrderType } from "@/app/types/models"; // Import the OrderType

export default function OrdersClient({ orders }: { orders: OrderType[] }) {
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeClass = (status: OrderType["status"]) => {
    const classes: Record<OrderType["status"], string> = {
      pending: "bg-yellow-100 text-yellow-800",
      payment_received: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return classes[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusBadgeClass = (status: OrderType["paymentStatus"]) => {
    const classes: Record<OrderType["paymentStatus"], string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };
    return classes[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="flex-1">
      <div className="mx-auto max-w-4xl p-6 py-14 lg:py-20">
        <h1 className="mb-6 text-2xl font-bold md:text-3xl">Your Orders</h1>

        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-12 text-center">
              <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold">No orders found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You haven't placed any orders yet.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order._id}
                className="rounded-lg border bg-card text-card-foreground"
              >
                <div className="flex items-center justify-between border-b p-4 md:p-6">
                  <div>
                    <p className="font-semibold">Order #{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
                <div className="grid gap-4 p-4 md:grid-cols-3 md:p-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total
                    </p>
                    <p className="font-semibold">${order.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Order Status
                    </p>
                    <Badge
                      variant="outline"
                      className={`${getStatusBadgeClass(
                        order.status,
                      )} capitalize`}
                    >
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Payment Status
                    </p>
                    <Badge
                      variant="outline"
                      className={`${getPaymentStatusBadgeClass(
                        order.paymentStatus,
                      )} capitalize`}
                    >
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
