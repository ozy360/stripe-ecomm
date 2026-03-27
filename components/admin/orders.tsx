"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DotsThreeOutlineIcon,
  EyeIcon,
  PackageIcon,
  CurrencyCircleDollarIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";

import {
  getOrders,
  getOrder,
  updateOrderStatus,
  updateOrderPaymentStatus,
} from "./actions";

// Define Types
interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
}

interface CryptoPayment {
  currency: "BTC" | "ETH" | "USDT";
  amount: number;
  walletAddress: string;
  txHash?: string;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface Order {
  _id: string;
  id?: string;
  orderNumber: string;
  user: string | { _id: string; fullname: string; email: string };
  items: OrderItem[];
  total: number;
  cryptoPayment: CryptoPayment;
  shippingAddress: ShippingAddress;
  status:
    | "pending"
    | "payment_received"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentStatus: "pending" | "confirmed" | "failed";
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, statusFilter, paymentStatusFilter, searchQuery]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const ordersData = await getOrders();
      setOrders(ordersData as Order[]);
      setFilteredOrders(ordersData as Order[]);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (typeof order.user === "object" &&
            order.user.email.toLowerCase().includes(searchQuery.toLowerCase())),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Payment status filter
    if (paymentStatusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.paymentStatus === paymentStatusFilter,
      );
    }

    setFilteredOrders(filtered);
  };

  const handleViewOrder = async (order: Order) => {
    const orderId = order._id || order.id;
    if (!orderId) return;

    try {
      const orderDetails = await getOrder(orderId);
      if (orderDetails) {
        setSelectedOrder(orderDetails as Order);
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      alert("Error loading order details");
    }
  };

  const handleUpdateStatus = async (status: Order["status"]) => {
    const orderId = selectedOrder?._id || selectedOrder?.id;
    if (!orderId) return;

    try {
      const result = await updateOrderStatus(orderId, status);

      if (result.success) {
        fetchOrders();
        // Update selected order
        if (selectedOrder) {
          setSelectedOrder({ ...selectedOrder, status });
        }
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleUpdatePaymentStatus = async (
    paymentStatus: Order["paymentStatus"],
  ) => {
    const orderId = selectedOrder?._id || selectedOrder?.id;
    if (!orderId) return;

    try {
      const result = await updateOrderPaymentStatus(orderId, paymentStatus);

      if (result.success) {
        fetchOrders();
        // Update selected order
        if (selectedOrder) {
          setSelectedOrder({ ...selectedOrder, paymentStatus });
        }
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeClass = (status: Order["status"]) => {
    const classes: Record<Order["status"], string> = {
      pending: "bg-yellow-100 text-yellow-800",
      payment_received: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return classes[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusBadgeClass = (status: Order["paymentStatus"]) => {
    const classes: Record<Order["paymentStatus"], string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };
    return classes[status] || "bg-gray-100 text-gray-800";
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPaymentStatusFilter("all");
  };

  const renderActionsMenu = (order: Order) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <DotsThreeOutlineIcon className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="grid gap-2">
          <DropdownMenuItem
            className="w-full cursor-pointer justify-start focus:outline-none"
            onClick={() => handleViewOrder(order)}
          >
            <EyeIcon className="mr-2 h-4 w-4" /> View Details
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const getUserName = (user: Order["user"]) => {
    if (typeof user === "object") {
      return user.fullname;
    }
    return "N/A";
  };

  const getUserEmail = (user: Order["user"]) => {
    if (typeof user === "object") {
      return user.email;
    }
    return "N/A";
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
      </div>

      {/* Filters Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="min-w-[250px] flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <Input
                id="search"
                placeholder="Search by order number or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="payment_received">
                  Payment Received
                </SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status Filter */}
          <div className="min-w-[180px]">
            <Select
              value={paymentStatusFilter}
              onValueChange={setPaymentStatusFilter}
            >
              <SelectTrigger id="payment-status-filter">
                <SelectValue placeholder="All Payments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {/* {(searchQuery ||
            statusFilter !== 'all' ||
            paymentStatusFilter !== 'all') && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )} */}
        </div>

        {/* Results Info */}
        <div className="text-sm text-gray-600">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="grid gap-6 py-4">
              {/* Customer Info */}
              <div className="grid gap-3 rounded-lg border p-4">
                <h3 className="font-semibold">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-600">Name</Label>
                    <div>{getUserName(selectedOrder.user)}</div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Email</Label>
                    <div>{getUserEmail(selectedOrder.user)}</div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="grid gap-3 rounded-lg border p-4">
                <h3 className="font-semibold">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b py-2 last:border-0"
                    >
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </div>
                      </div>
                      <div className="font-medium">
                        ${item.price.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 font-bold">
                    <div>Total</div>
                    <div>${selectedOrder.total.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Crypto Payment */}
              <div className="grid gap-3 rounded-lg border p-4">
                <h3 className="font-semibold">Crypto Payment</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-600">Currency</Label>
                    <div className="flex items-center gap-2">
                      <CurrencyCircleDollarIcon className="h-4 w-4" />
                      {selectedOrder.cryptoPayment.currency}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Amount</Label>
                    <div>{selectedOrder.cryptoPayment.amount}</div>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-gray-600">Wallet Address</Label>
                    <code className="bg-card mt-1">
                      {selectedOrder.cryptoPayment.walletAddress ||
                        "No address"}
                    </code>
                  </div>
                  {selectedOrder.cryptoPayment.txHash && (
                    <div className="col-span-2">
                      <Label className="text-gray-600">Transaction Hash</Label>
                      <code className="mt-1 block rounded bg-gray-100 px-2 py-1 text-xs">
                        {selectedOrder.cryptoPayment.txHash}
                      </code>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="grid gap-3 rounded-lg border p-4">
                <h3 className="font-semibold">Shipping Address</h3>
                <div className="text-sm">
                  <div>{selectedOrder.shippingAddress.street}</div>
                  <div>
                    {selectedOrder.shippingAddress.city},{" "}
                    {selectedOrder.shippingAddress.state}{" "}
                    {selectedOrder.shippingAddress.zipCode}
                  </div>
                  <div>{selectedOrder.shippingAddress.country}</div>
                </div>
              </div>

              {/* Status Management */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="order-status">Order Status</Label>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) =>
                      handleUpdateStatus(value as Order["status"])
                    }
                  >
                    <SelectTrigger id="order-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="payment_received">
                        Payment Received
                      </SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="payment-status">Payment Status</Label>
                  <Select
                    value={selectedOrder.paymentStatus}
                    onValueChange={(value) =>
                      handleUpdatePaymentStatus(value as Order["paymentStatus"])
                    }
                  >
                    <SelectTrigger id="payment-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="grid gap-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={selectedOrder.notes}
                    readOnly
                    className="min-h-[80px]"
                  />
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-600">Created</Label>
                  <div>{formatDate(selectedOrder.createdAt)}</div>
                </div>
                <div>
                  <Label className="text-gray-600">Last Updated</Label>
                  <div>{formatDate(selectedOrder.updatedAt)}</div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Orders Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              {/* <TableHead>Payment</TableHead> */}
              <TableHead>Order Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order._id || order.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <PackageIcon className="h-4 w-4 text-gray-400" />
                      {order.orderNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {getUserName(order.user)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {getUserEmail(order.user)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${order.total.toFixed(2)}
                  </TableCell>
                  {/* <TableCell>
                    <div className="flex items-center gap-2">
                      <CurrencyCircleDollarIcon className="h-4 w-4 text-gray-400" />
                      {order.cryptoPayment.currency}
                    </div>
                  </TableCell> */}
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(order.status)}`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPaymentStatusBadgeClass(order.paymentStatus)}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    {renderActionsMenu(order)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
