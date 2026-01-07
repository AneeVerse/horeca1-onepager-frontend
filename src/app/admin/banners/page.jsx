"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PlusIcon, TrashIcon, MagnifyingGlassIcon, Bars3Icon } from "@heroicons/react/24/outline";
import CloudinaryUploader from "@components/admin/CloudinaryUploader";
import { getAllBannersAdmin, addBanner, deleteBanner, updateBanner, reorderBanners } from "@services/BannerService";
import { notifySuccess, notifyError } from "@utils/toast";
import Image from "next/image";

// Sortable Banner Card Component
function SortableBannerCard({ banner, onToggleActive, onDelete }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: banner._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white rounded-lg shadow-sm border-2 overflow-hidden ${
                banner.isActive ? "border-green-200" : "border-gray-200 opacity-60"
            }`}
        >
            {/* Banner Preview */}
            <div className="relative aspect-video bg-gray-100">
                {banner.image ? (
                    <Image
                        src={banner.image}
                        alt="Banner"
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        No Image
                    </div>
                )}
                {!banner.isActive && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        Inactive
                    </div>
                )}
            </div>

            {/* Banner Info */}
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Order: {banner.order}</span>
                    <button
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1"
                        title="Drag to reorder"
                    >
                        <Bars3Icon className="w-5 h-5" />
                    </button>
                </div>

                {banner.mobileImage && (
                    <div className="text-xs text-gray-500">
                        Mobile image: ✓
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={() => onToggleActive(banner)}
                        className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                            banner.isActive
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                : "bg-green-100 text-green-800 hover:bg-green-200"
                        }`}
                    >
                        {banner.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                        onClick={() => onDelete(banner._id)}
                        className="px-3 py-2 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function BannersPage() {
    const [banners, setBanners] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newBanner, setNewBanner] = useState({
        image: "",
        mobileImage: "",
    });
    const [uploading, setUploading] = useState(false);
    const [filteredBanners, setFilteredBanners] = useState([]);

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Load banners on mount
    useEffect(() => {
        fetchBanners();
    }, []);

    // Update filtered banners when banners or search term changes
    useEffect(() => {
        const filtered = banners.filter(banner =>
            banner.image?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredBanners(filtered);
    }, [banners, searchTerm]);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const data = await getAllBannersAdmin();
            setBanners(data);
        } catch (error) {
            const errorMessage = error.message || "Failed to load banners";
            notifyError(errorMessage);
            console.error("Error fetching banners:", error);
            // If authentication error, redirect to login
            if (errorMessage.includes("authentication") || errorMessage.includes("401")) {
                window.location.href = "/admin/login";
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddBanner = async () => {
        if (!newBanner.image) {
            notifyError("Please upload at least a desktop image");
            return;
        }

        setUploading(true);
        try {
            await addBanner(newBanner);
            notifySuccess("Banner added successfully!");
            setShowAddModal(false);
            setNewBanner({ image: "", mobileImage: "" });
            fetchBanners();
        } catch (error) {
            const errorMessage = error.message || "Failed to add banner";
            notifyError(errorMessage);
            console.error("Error adding banner:", error);
            // If authentication error, redirect to login
            if (errorMessage.includes("authentication") || errorMessage.includes("401")) {
                window.location.href = "/admin/login";
            }
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteBanner = async (id) => {
        if (!confirm("Are you sure you want to delete this banner?")) {
            return;
        }

        try {
            await deleteBanner(id);
            notifySuccess("Banner deleted successfully!");
            fetchBanners();
        } catch (error) {
            notifyError(error.message || "Failed to delete banner");
        }
    };

    const handleToggleActive = async (banner) => {
        try {
            await updateBanner(banner._id, { isActive: !banner.isActive });
            notifySuccess(`Banner ${banner.isActive ? "deactivated" : "activated"} successfully!`);
            fetchBanners();
        } catch (error) {
            notifyError(error.message || "Failed to update banner");
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = filteredBanners.findIndex((banner) => banner._id === active.id);
            const newIndex = filteredBanners.findIndex((banner) => banner._id === over.id);

            const newBanners = arrayMove(filteredBanners, oldIndex, newIndex);

            // Update order in backend
            const bannersWithOrder = newBanners.map((banner, index) => ({
                id: banner._id,
                order: index,
            }));

            try {
                await reorderBanners(bannersWithOrder);
                notifySuccess("Banner order updated!");

                // Update local state with new order
                const updatedBanners = newBanners.map((banner, index) => ({
                    ...banner,
                    order: index,
                }));

                setBanners(updatedBanners);
                setFilteredBanners(updatedBanners);
            } catch (error) {
                notifyError(error.message || "Failed to reorder banners");
                // Revert on error by refetching
                fetchBanners();
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
                        <p className="text-gray-600 mt-1">Manage hero banner images for your homepage</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#018549] text-white rounded-lg hover:bg-[#016d3b] transition-colors font-medium"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add Banner
                    </button>
                </div>
            </div>

            {/* Search and Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search banners..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#018549] focus:border-[#018549]"
                        />
                    </div>
                    <div className="text-sm text-gray-600">
                        <span className="font-semibold text-[#018549]">{banners.length}</span> banners total
                        {" "}
                        <span className="font-semibold text-green-600">
                            {banners.filter(b => b.isActive).length}
                        </span> active
                    </div>
                </div>
            </div>

            {/* Banners Grid */}
            {loading ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <p className="text-gray-500">Loading banners...</p>
                </div>
            ) : filteredBanners.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <p className="text-gray-500">
                        {searchTerm ? "No banners match your search" : "No banners added yet. Click 'Add Banner' to get started."}
                    </p>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={filteredBanners.map(b => b._id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredBanners.map((banner) => (
                                <SortableBannerCard
                                    key={banner._id}
                                    banner={banner}
                                    onToggleActive={handleToggleActive}
                                    onDelete={handleDeleteBanner}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {/* Add Banner Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Add New Banner</h2>
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setNewBanner({ image: "", mobileImage: "" });
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Desktop Image */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Desktop Image <span className="text-red-500">*</span>
                                    </label>
                                    <CloudinaryUploader
                                        imageUrl={newBanner.image}
                                        setImageUrl={(url) => setNewBanner({ ...newBanner, image: url })}
                                        multiple={false}
                                    />
                                </div>

                                {/* Mobile Image (Optional) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mobile Image (Optional)
                                    </label>
                                    <CloudinaryUploader
                                        imageUrl={newBanner.mobileImage}
                                        setImageUrl={(url) => setNewBanner({ ...newBanner, mobileImage: url })}
                                        multiple={false}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        If not provided, desktop image will be used for mobile
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 justify-end pt-4 border-t">
                                    <button
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setNewBanner({ image: "", mobileImage: "" });
                                        }}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        disabled={uploading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddBanner}
                                        disabled={uploading || !newBanner.image}
                                        className="px-4 py-2 bg-[#018549] text-white rounded-lg hover:bg-[#016d3b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {uploading ? "Adding..." : "Add Banner"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

