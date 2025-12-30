"use strict";
"use client";

import { useEffect, useState } from "react";
import { getAllCustomers } from "@services/CustomerServices";
import {
  MagnifyingGlassIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { customers, error } = await getAllCustomers();
      if (error) {
        setError(error);
      } else {
        // Handle different response structures
        const customerList = Array.isArray(customers)
          ? customers
          : customers?.users
            ? customers.users
            : customers?.data
              ? customers.data
              : [];

        setCustomers(customerList);
        setFilteredCustomers(customerList);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredCustomers(customers);
      return;
    }
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = customers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(lowerQuery) ||
        customer.email?.toLowerCase().includes(lowerQuery) ||
        customer.phone?.toLowerCase().includes(lowerQuery)
    );
    setFilteredCustomers(filtered);
  }, [searchQuery, customers]);

  // Pagination logic can be added here if needed, currently showing all

  const totalCustomers = customers.length;
  // Calculate verified customers if the field exists, else just show total
  const verifiedCustomers = customers.filter(c => c.isVerified || c.emailVerified).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your customer base and view details.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          {/* Action buttons could go here */}
        </div>
      </div>



      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-gray-200 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:px-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Name
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Contact Info
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Address
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      <div className="flex items-center gap-3">
                        {customer.image ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={customer.image}
                            alt=""
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                            <UserIcon className="h-6 w-6" />
                          </div>
                        )}
                        <div className="font-semibold">{customer.name || "N/A"}</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                          <span>{customer.email}</span>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2">
                            <PhoneIcon className="h-4 w-4 text-gray-400" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-start gap-2 max-w-xs truncate">
                        {customer.address ? (
                          <>
                            <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span title={customer.address}>{customer.address}</span>
                          </>
                        ) : (
                          <span className="text-gray-400 italic">No address</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      {customer.status === "Active" || !customer.status ? ( // Assuming default is active if undefined
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        {dayjs(customer.createdAt).format("MMM D, YYYY")}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-gray-500">
                    No customers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
