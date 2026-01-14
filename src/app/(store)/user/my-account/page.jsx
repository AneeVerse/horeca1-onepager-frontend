import React from "react";
import Link from "next/link";
import { Plus, MapPin } from "lucide-react";

//internal imports
import { getUserServerSession } from "@lib/auth-server";
import { getShippingAddress, getCustomerById } from "@services/CustomerServices";
import AddressCardList from "@components/user-dashboard/AddressCardList";

const MyAccount = async () => {
  const sessionUser = await getUserServerSession();

  // Get customer ID - check both id and _id (session might use either)
  const customerId = sessionUser?.id || sessionUser?._id || sessionUser?.user?._id || sessionUser?.user?.id;

  // Fetch fresh customer data from database instead of relying on session
  const { customer, error: customerError } = customerId
    ? await getCustomerById(customerId)
    : { customer: null, error: null };

  // Use customer data from database if available, otherwise fall back to session
  const userInfo = customer || sessionUser;

  const { shippingAddress, shippingAddresses, error } = await getShippingAddress({
    id: "", // Pass empty ID to fetch all shipping addresses for this user
  });

  const hasShippingAddresses = shippingAddresses && shippingAddresses.length > 0;

  return (
    <div className="overflow-hidden">
      <div className="mb-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Shipping Addresses</h2>
          <Link
            href="/user/add-shipping-address"
            className="flex items-center gap-2 bg-[#018549] text-white hover:bg-[#016e3c] rounded-xl py-2.5 px-4 text-sm font-semibold transition-all shadow-md"
          >
            <Plus className="w-4 h-4" /> Add New Address
          </Link>
        </div>

        {/* Address List or Empty State */}
        {hasShippingAddresses ? (
          <AddressCardList
            addresses={shippingAddresses}
            customerId={customerId}
          />
        ) : (
          <div className="flex h-full relative">
            <Link
              href="/user/add-shipping-address"
              className="flex items-center justify-center bg-[#018549] text-white hover:bg-[#016e3c] w-full rounded-2xl py-5 px-4 text-center transition-all shadow-lg shadow-emerald-900/10 font-bold"
            >
              <Plus className="w-6 h-6 mr-3" /> Add Your Shipping Address
            </Link>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAccount;
