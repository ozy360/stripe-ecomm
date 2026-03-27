"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Overview from "@/components/admin/overview";
import Users from "@/components/admin/users";
import Products from "@/components/admin/products";
import Orders from "@/components/admin/orders";
import { logoutAction } from "./actions";
import { SignOutIcon } from "@phosphor-icons/react";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-6xl p-6 py-14 lg:py-20">
      <Button
        variant="outline"
        className="mb-8 cursor-pointer"
        onClick={() => logoutAction()}
      >
        <SignOutIcon className="mr-1 h-4 w-4" />
        Logout
      </Button>
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Admin Dashboard</h1>
        <p className="text-gray-500">Manage users, products, and orders</p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-4 sm:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardContent>
              <Overview />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardContent>
              <Users />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <Card>
            <CardContent>
              <Products />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardContent>
              <Orders />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
