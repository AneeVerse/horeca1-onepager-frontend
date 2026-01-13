import React from "react";
import Link from "next/link";
import { Plus, MapPin } from "lucide-react";

//internal imports

import { getUserServerSession } from "@lib/auth-server";
import { getShippingAddress, getCustomerById } from "@services/CustomerServices";

const MyAccount = async () => {
  const sessionUser = await getUserServerSession();

  // Get customer ID - check both id and _id (session might use either)
  const customerId = sessionUser?.id || sessionUser?._id || sessionUser?.user?._id || sessionUser?.user?.id;

  // Fetch fresh customer data from database instead of relying on session
  const { customer, error: customerError } = customerId
    ? await getCustomerById(customerId)
    : { customer: null, error: null };

  // #region agent log
  const fs = require('fs');
  const logPath = 'c:\\Users\\Roger\\Desktop\\horeca1\\Horeca1\\.cursor\\debug.log';
  try {
    fs.appendFileSync(logPath, JSON.stringify({ location: 'my-account/page.jsx:17', message: 'Fetched customer data', data: { customerId, customerName: customer?.name, customerEmail: customer?.email, customerPhone: customer?.phone, hasCustomer: !!customer }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) + '\n');
  } catch (e) { }
  // #endregion

  // Use customer data from database if available, otherwise fall back to session
  const userInfo = customer || sessionUser;

  const { shippingAddress, error } = await getShippingAddress({
    id: customerId || userInfo?.id || userInfo?._id,
  });
  // console.log("shippingAddress", shippingAddress);

  const hasShippingAddress =
    shippingAddress && Object.keys(shippingAddress).length > 0;

  // console.log("error", error);

  // const defaultAddress = error ? [] : shippingAddress[0];

  return (
    <div className="overflow-hidden">
      <div className="grid gap-4 mb-8 grid-cols-1 max-w-2xl">
        {/* Shipping Address Card */}
        {hasShippingAddress ? (
          <div className="flex h-full relative">
            <div className="flex items-center border border-gray-100 shadow-sm w-full rounded-2xl p-6 relative bg-white transition-all hover:shadow-md">
              <Link
                href={`/user/shipping-address?id=${userInfo?.id}`}
                className="absolute top-4 right-4 border border-[#018549] text-[#018549] px-4 py-1.5 rounded-xl text-sm font-semibold hover:bg-[#018549] hover:text-white transition-all"
              >
                Edit
              </Link>
              <div className="flex-grow">
                {error ? (
                  <h2 className="text-xl text-center my-10 mx-auto w-11/12 text-red-400">
                    {error}
                  </h2>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-[#018549]">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="leading-none text-base font-bold text-gray-800">
                          {shippingAddress?.name}
                        </h5>
                        <span className="text-xs text-[#018549] font-medium">Default Shipping Address</span>
                      </div>
                    </div>

                    <div className="space-y-1 pl-13">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="font-medium text-gray-400 text-xs uppercase tracking-wider">Contact:</span>
                        {shippingAddress?.contact}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="font-medium text-gray-400 text-xs uppercase tracking-wider">Address:</span>
                        {shippingAddress?.address}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="font-medium text-gray-400 text-xs uppercase tracking-wider">Location:</span>
                        {shippingAddress?.country}, {shippingAddress?.city}, {shippingAddress?.area} - {shippingAddress?.zipCode}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
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
      </div>
    </div>
  );
};

export default MyAccount;

