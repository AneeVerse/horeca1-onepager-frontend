"use client";

import React, { useState } from "react";
import { MapPin, Edit2, Trash2, Star, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { getUserSession } from "@lib/auth-client";
import { notifySuccess, notifyError } from "@utils/toast";

const AddressCardList = ({ addresses, customerId }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(null); // Track which action is loading
    const [localAddresses, setLocalAddresses] = useState(addresses);

    const userInfo = getUserSession();
    const token = userInfo?.token;

    const handleSetDefault = async (addressId) => {
        setLoading(`default-${addressId}`);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/customer/shipping/address/${customerId}/${addressId}/default`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to set default address");
            }

            // Update local state
            setLocalAddresses(result.shippingAddresses || localAddresses.map(addr => ({
                ...addr,
                isDefault: addr._id === addressId,
            })));

            notifySuccess("Default address updated!");
            router.refresh();
        } catch (error) {
            notifyError(error.message || "Failed to set default address");
        } finally {
            setLoading(null);
        }
    };

    const handleDelete = async (addressId) => {
        if (!confirm("Are you sure you want to delete this address?")) return;

        setLoading(`delete-${addressId}`);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/customer/shipping/address/${customerId}/${addressId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to delete address");
            }

            // Update local state
            setLocalAddresses(result.shippingAddresses || localAddresses.filter(addr => addr._id !== addressId));

            notifySuccess("Address deleted successfully!");
            router.refresh();
        } catch (error) {
            notifyError(error.message || "Failed to delete address");
        } finally {
            setLoading(null);
        }
    };

    const handleEdit = (addressId) => {
        router.push(`/user/shipping-address?id=${addressId}`);
    };

    return (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {localAddresses.map((address) => (
                <div
                    key={address._id}
                    className={`relative border rounded-2xl p-5 bg-white transition-all hover:shadow-md ${address.isDefault
                            ? "border-[#018549] ring-1 ring-[#018549]/20"
                            : "border-gray-100"
                        }`}
                >
                    {/* Default Badge */}
                    {address.isDefault && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-50 text-[#018549] px-2 py-1 rounded-full text-xs font-semibold">
                            <Check className="w-3 h-3" /> Default
                        </div>
                    )}

                    {/* Address Content */}
                    <div className="pr-20">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-[#018549]">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <h5 className="font-bold text-gray-800">{address.name}</h5>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                            <p>{address.address}</p>
                            <p>
                                {address.city}, {address.country} - {address.zipCode}
                            </p>
                            <p className="text-gray-500">+91 {address.contact}</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                        <button
                            onClick={() => handleEdit(address._id)}
                            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#018549] font-medium transition-colors"
                        >
                            <Edit2 className="w-4 h-4" /> Edit
                        </button>

                        {!address.isDefault && (
                            <>
                                <span className="text-gray-300">|</span>
                                <button
                                    onClick={() => handleSetDefault(address._id)}
                                    disabled={loading === `default-${address._id}`}
                                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#018549] font-medium transition-colors disabled:opacity-50"
                                >
                                    {loading === `default-${address._id}` ? (
                                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Star className="w-4 h-4" />
                                    )}
                                    Set Default
                                </button>
                            </>
                        )}

                        <span className="text-gray-300">|</span>
                        <button
                            onClick={() => handleDelete(address._id)}
                            disabled={loading === `delete-${address._id}`}
                            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium transition-colors disabled:opacity-50"
                        >
                            {loading === `delete-${address._id}` ? (
                                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AddressCardList;
