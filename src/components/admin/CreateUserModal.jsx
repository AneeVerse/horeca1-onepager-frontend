"use client";

import { useState } from "react";
import { XMarkIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { lookupPincode } from "@utils/pincode";

export default function CreateUserModal({ isOpen, onClose, onUserCreated }) {
    const [formData, setFormData] = useState({
        name: "",
        outletName: "",
        phone: "",
        email: "",
        address: "",
        zipCode: "",
        city: "",
        country: "", // State
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [pincodeLoading, setPincodeLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const handlePincodeChange = async (e) => {
        const value = e.target.value;
        const pincode = value.replace(/\D/g, "");

        setFormData(prev => ({ ...prev, zipCode: pincode }));

        if (errors.zipCode) {
            setErrors(prev => ({ ...prev, zipCode: null }));
        }

        if (pincode.length === 6) {
            setPincodeLoading(true);

            // Check if PIN code is serviceable
            const storedPincodes = typeof window !== 'undefined' ? localStorage.getItem("deliveryPincodes") : null;
            if (storedPincodes) {
                const allowedPincodes = JSON.parse(storedPincodes);
                const isServiceable = allowedPincodes.some(p => p.pincode === pincode);

                if (!isServiceable) {
                    setErrors(prev => ({ ...prev, zipCode: "Sorry currently we do not have service in your pincode. Hope to serve you soon" }));
                    setFormData(prev => ({
                        ...prev,
                        city: "",
                        country: "",
                    }));
                    setPincodeLoading(false);
                    return;
                }
            }

            const result = await lookupPincode(pincode);
            if (result.success) {
                setFormData(prev => ({
                    ...prev,
                    city: result.district || result.city,
                    country: result.state,
                }));
                setErrors(prev => ({ ...prev, zipCode: null }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    city: "",
                    country: "",
                }));
                // Specific message as requested by user
                setErrors(prev => ({ ...prev, zipCode: "We do not deliver to this location." }));
            }
            setPincodeLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Name validation (mandatory)
        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }
        // Outlet Name validation (mandatory)
        if (!formData.outletName.trim()) {
            newErrors.outletName = "Outlet name is required";
        }

        // Phone validation (mandatory)
        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^\d{10,15}$/.test(formData.phone.replace(/\s/g, ""))) {
            newErrors.phone = "Please enter a valid phone number (10-15 digits)";
        }

        // Email validation (optional, but must be valid if provided)
        if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Address validation (optional, but if provided, PIN must be valid)
        if (formData.zipCode && formData.zipCode.length !== 6) {
            newErrors.zipCode = "PIN Code must be 6 digits";
        } else if (errors.zipCode) {
            // Prevent submission if the "We do not deliver..." error is present
            newErrors.zipCode = errors.zipCode;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/admin/customer/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    outletName: formData.outletName.trim(),
                    phone: formData.phone.trim(),
                    email: formData.email.trim() || undefined,
                    address: formData.address.trim() || undefined,
                    zipCode: formData.zipCode.trim() || undefined,
                    city: formData.city.trim() || undefined,
                    country: formData.country.trim() || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create user");
            }

            // Reset form
            setFormData({
                name: "",
                outletName: "",
                phone: "",
                email: "",
                address: "",
                zipCode: "",
                city: "",
                country: "",
            });
            setErrors({});

            // Notify parent component
            if (onUserCreated) {
                onUserCreated(data.customer);
            }

            // Close modal
            onClose();
        } catch (error) {
            console.error("Error creating user:", error);
            setSubmitError(error.message || "Failed to create user. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setFormData({
                name: "",
                outletName: "",
                phone: "",
                email: "",
                address: "",
                zipCode: "",
                city: "",
                country: "",
            });
            setErrors({});
            setSubmitError(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-2xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                                    <UserPlusIcon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">Create New User</h3>
                            </div>
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={loading}
                                className="rounded-full p-1 text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-6 py-6">
                        {submitError && (
                            <div className="mb-4 rounded-md bg-red-50 p-3 border border-red-200">
                                <p className="text-sm text-red-700">{submitError}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Name Field */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className={`block w-full rounded-md border ${errors.name ? "border-red-300" : "border-gray-300"
                                        } px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                    placeholder="Enter customer name"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            {/* Phone Field */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className={`block w-full rounded-md border ${errors.phone ? "border-red-300" : "border-gray-300"
                                        } px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                    placeholder="Enter phone number"
                                />
                                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                            </div>
                        </div>

                        {/* Email and Outlet Name Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-gray-400 text-xs">(Optional)</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className={`block w-full rounded-md border ${errors.email ? "border-red-300" : "border-gray-300"
                                        } px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                    placeholder="Enter email address"
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            {/* Outlet Name Field */}
                            <div>
                                <label htmlFor="outletName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Outlet Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="outletName"
                                    name="outletName"
                                    value={formData.outletName}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className={`block w-full rounded-md border ${errors.outletName ? "border-red-300" : "border-gray-300"
                                        } px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                    placeholder="Enter outlet name"
                                />
                                {errors.outletName && <p className="mt-1 text-sm text-red-600">{errors.outletName}</p>}
                            </div>
                        </div>

                        <div className="border-t border-gray-100 my-4 pt-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4">Address Details <span className="text-gray-400 text-xs font-normal">(Optional)</span></h4>

                            {/* PIN Code, City, State Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                                        PIN Code
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="zipCode"
                                            name="zipCode"
                                            maxLength={6}
                                            value={formData.zipCode}
                                            onChange={handlePincodeChange}
                                            disabled={loading}
                                            className={`block w-full rounded-md border ${errors.zipCode ? "border-red-300 ring-1 ring-red-300" : "border-gray-300"} px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                            placeholder="6-digit PIN"
                                        />
                                        {pincodeLoading && (
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                                            </div>
                                        )}
                                    </div>
                                    {errors.zipCode && <p className="mt-1 text-xs text-red-600">{errors.zipCode}</p>}
                                </div>
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        placeholder="City"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        placeholder="State"
                                    />
                                </div>
                            </div>

                            {/* Address Field */}
                            <div className="mb-6">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                    Complete Address
                                </label>
                                <textarea
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    disabled={loading}
                                    rows={2}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                                    placeholder="House/Flat No., Building, Street"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={loading}
                                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create User"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div >
        </div >
    );
}
