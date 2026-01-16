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
  PlusIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import CreateUserModal from "@components/admin/CreateUserModal";
import EditUserModal from "@components/admin/EditUserModal";
import DeleteConfirmationModal from "@components/admin/DeleteConfirmationModal";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleDeleteCustomer = (customerId, customerName) => {
    setCustomerToDelete({ id: customerId, name: customerName });
    setIsDeleteModalOpen(true);
    setOpenDropdownId(null);
  };

  const confirmDeletion = async () => {
    if (!customerToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/admin/customer/delete/${customerToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete customer");
        return;
      }

      // Remove customer from the list
      setCustomers(customers.filter(c => c._id !== customerToDelete.id));
      setFilteredCustomers(filteredCustomers.filter(c => c._id !== customerToDelete.id));
      setIsDeleteModalOpen(false);
      setCustomerToDelete(null);
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Failed to delete customer. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
    setOpenDropdownId(null);
  };

  const toggleDropdown = (customerId) => {
    setOpenDropdownId(openDropdownId === customerId ? null : customerId);
  };

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
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Create User
          </button>
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
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer, index) => (
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
                        <div className="flex flex-col">
                          <div className="font-semibold text-gray-900">{customer.name || "N/A"}</div>
                          {customer.outletName && (
                            <div className="text-xs font-medium text-blue-600">{customer.outletName}</div>
                          )}
                        </div>
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
                            <div className="flex flex-col">
                              <span title={customer.address}>{customer.address}</span>
                              {(customer.zipCode || customer.city) && (
                                <span className="text-xs text-blue-600 font-medium">
                                  {[customer.zipCode, customer.city, customer.country].filter(Boolean).join(", ")}
                                </span>
                              )}
                            </div>
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
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => toggleDropdown(customer._id)}
                          className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <span className="sr-only">Open options</span>
                          <EllipsisVerticalIcon className="h-5 w-5" />
                        </button>

                        {/* Dropdown menu */}
                        {openDropdownId === customer._id && (
                          <>
                            {/* Backdrop to close dropdown when clicking outside */}
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdownId(null)}
                            />

                            {/* Dropdown panel */}
                            <div className={`absolute right-0 z-20 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${index >= filteredCustomers.length - 2 && filteredCustomers.length > 2
                              ? "bottom-full mb-2 origin-bottom-right"
                              : "top-full mt-2 origin-top-right"
                              }`}>
                              <div className="py-1">
                                <button
                                  onClick={() => handleEditCustomer(customer)}
                                  className="group flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                >
                                  <PencilIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteCustomer(customer._id, customer.name || 'this customer')}
                                  className="group flex w-full items-center gap-3 px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-900"
                                >
                                  <TrashIcon className="h-4 w-4 text-red-400 group-hover:text-red-500" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-gray-500">
                    No customers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={(newCustomer) => {
          // Add new customer to the list
          setCustomers([newCustomer, ...customers]);
          setFilteredCustomers([newCustomer, ...filteredCustomers]);
        }}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
        onUserUpdated={(updatedCustomer) => {
          // Update customer in the list
          setCustomers(customers.map(c =>
            c._id === updatedCustomer._id ? updatedCustomer : c
          ));
          setFilteredCustomers(filteredCustomers.map(c =>
            c._id === updatedCustomer._id ? updatedCustomer : c
          ));
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCustomerToDelete(null);
        }}
        onConfirm={confirmDeletion}
        customerName={customerToDelete?.name}
        loading={deleteLoading}
      />
    </div>
  );
}

