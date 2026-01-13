"use client";

import { useActionState, useState } from "react";
import { IoLocationOutline } from "react-icons/io5";

//internal imports
import Error from "@components/form/Error";
import ErrorTwo from "@components/form/ErrorTwo";
import { getUserSession } from "@lib/auth-client";
import useCustomToast from "@hooks/useCustomToast";
import SubmitButton from "@components/user-dashboard/SubmitButton";
import { addShippingAddress } from "@services/ServerActionServices";
import { lookupPincode } from "@utils/pincode";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";

const AddShippingAddress = () => {
  const userInfo = getUserSession();
  const [state, formAction] = useActionState(
    addShippingAddress.bind(null, userInfo),
    undefined
  );

  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState("");
  const [formData, setFormData] = useState({
    name: userInfo?.name || "",
    address: "",
    contact: userInfo?.phone?.replace("+91 ", "") || "",
    country: "", // Using State as Country in DB
    city: "",
    zipCode: "",
  });

  const { formRef } = useCustomToast(state);

  // Handle PIN code lookup
  const handlePincodeChange = async (pincode) => {
    const cleanPincode = pincode.replace(/\D/g, "");
    setFormData(prev => ({ ...prev, zipCode: cleanPincode }));

    if (cleanPincode.length === 6) {
      setPincodeLoading(true);
      setPincodeError("");

      const result = await lookupPincode(cleanPincode);

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          city: result.district || result.city,
          country: result.state,
        }));
        setPincodeError("");
      } else {
        setPincodeError(result.error || "Invalid PIN code");
      }
      setPincodeLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header section with icon */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
          <IoLocationOutline className="w-6 h-6 text-[#018549]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Shipping Address</h1>
          <p className="text-sm text-gray-500">Add a new delivery location for your orders</p>
        </div>
      </div>

      <form ref={formRef} action={formAction} className="space-y-6">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-100/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Left Column: Contact info */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Input full name"
                  className="rounded-xl border-gray-200 focus:border-[#018549] focus:ring-[#018549]/20 h-12"
                />
                <Error errorName={state?.errors?.name?.join(" ")} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">+91</span>
                  <Input
                    name="contact"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={formData.contact}
                    onChange={(e) => setFormData(p => ({ ...p, contact: e.target.value.replace(/\D/g, "") }))}
                    placeholder="10-digit mobile number"
                    className="pl-14 rounded-xl border-gray-200 focus:border-[#018549] focus:ring-[#018549]/20 h-12 w-full"
                  />
                </div>
                <ErrorTwo errors={state?.errors?.contact} />
              </div>
            </div>

            {/* Right Column: Address info */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      name="zipCode"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={formData.zipCode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      placeholder="6-digit PIN"
                      className="rounded-xl border-gray-200 focus:border-[#018549] focus:ring-[#018549]/20 h-12 w-full"
                    />
                    {pincodeLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  {pincodeError && <p className="text-xs text-red-500 mt-1">{pincodeError}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                  </label>
                  <Input
                    name="city"
                    type="text"
                    readOnly
                    value={formData.city}
                    className="rounded-xl border-gray-100 bg-gray-50 text-gray-500 h-12 cursor-not-allowed"
                  />
                  <Error errorName={state?.errors?.city?.join(" ")} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State / Territory
                </label>
                <Input
                  name="country"
                  type="text"
                  readOnly
                  value={formData.country}
                  className="rounded-xl border-gray-100 bg-gray-50 text-gray-500 h-12 cursor-not-allowed"
                />
                <Error errorName={state?.errors?.country?.join(" ")} />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Complete Address <span className="text-red-500">*</span>
            </label>
            <Textarea
              name="address"
              value={formData.address}
              onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
              placeholder="House/Flat No., Building, Street, Landmark"
              className="rounded-2xl border-gray-200 focus:border-[#018549] focus:ring-[#018549]/20 min-h-[120px] resize-none py-4 px-5"
            />
            <Error errorName={state?.errors?.address?.join(" ")} />
          </div>

          <div className="mt-10 flex justify-end">
            <SubmitButton
              title="Save Delivery Address"
              className="bg-[#018549] hover:bg-[#016e3c] text-white px-10 h-14 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-emerald-900/10 hover:shadow-emerald-900/20 w-full md:w-auto"
            />
          </div>
        </div>

        {/* Hidden internal fields */}
        <input type="hidden" name="userId" value={userInfo?._id || ""} />
        <input type="hidden" name="area" value={formData.city} />

      </form>
    </div>
  );
};

export default AddShippingAddress;


