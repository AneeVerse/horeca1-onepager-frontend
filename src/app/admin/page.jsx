"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderIcon,
  CubeIcon,
  ShoppingCartIcon,
  UsersIcon,
  TicketIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { getAllCategories } from "@services/AdminCategoryService";
import { getAllProducts } from "@services/AdminProductService";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    categories: 0,
    products: 0,
    orders: 0,
    customers: 0,
    coupons: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
        const { baseURL } = await import("@services/CommonService");
        
        const [categoriesRes, productsRes, ordersRes] = await Promise.all([
          getAllCategories(),
          getAllProducts(),
          fetch(`${baseURL}/orders/dashboard-count`, {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }).then(res => res.ok ? res.json() : { totalOrder: 0 }).catch(() => ({ totalOrder: 0 })),
        ]);

        setStats({
          categories: categoriesRes.categories?.length || 0,
          products: productsRes.products?.products?.length || productsRes.products?.length || 0,
          orders: ordersRes.totalOrder || 0,
          customers: 0, // TODO: Add customers API
          coupons: 0, // TODO: Add coupons API
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      name: "Categories",
      value: stats.categories,
      icon: FolderIcon,
      href: "/admin/categories",
      color: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      name: "Products",
      value: stats.products,
      icon: CubeIcon,
      href: "/admin/products",
      color: "bg-green-500",
      textColor: "text-green-600",
    },
    {
      name: "Orders",
      value: stats.orders,
      icon: ShoppingCartIcon,
      href: "/admin/orders",
      color: "bg-purple-500",
      textColor: "text-purple-600",
    },
    {
      name: "Customers",
      value: stats.customers,
      icon: UsersIcon,
      href: "/admin/customers",
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
    },
    {
      name: "Coupons",
      value: stats.coupons,
      icon: TicketIcon,
      href: "/admin/coupons",
      color: "bg-pink-500",
      textColor: "text-pink-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to your admin panel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="relative overflow-hidden rounded-lg bg-white px-6 py-5 shadow-sm ring-1 ring-gray-900/5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-lg ${stat.color} p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className={`text-2xl font-semibold ${stat.textColor}`}>
                  {stats.loading ? (
                    <span className="inline-block h-8 w-12 animate-pulse bg-gray-200 rounded"></span>
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
              <div
                className={`h-full ${stat.color} transition-all`}
                style={{ width: "100%" }}
              ></div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/categories"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:border-blue-500 hover:shadow-sm transition-all"
          >
            <FolderIcon className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Manage Categories</p>
              <p className="text-sm text-gray-500">Add or edit categories</p>
            </div>
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:border-green-500 hover:shadow-sm transition-all"
          >
            <CubeIcon className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Manage Products</p>
              <p className="text-sm text-gray-500">Add or edit products</p>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:border-purple-500 hover:shadow-sm transition-all"
          >
            <ShoppingCartIcon className="h-8 w-8 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">View Orders</p>
              <p className="text-sm text-gray-500">Manage customer orders</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

