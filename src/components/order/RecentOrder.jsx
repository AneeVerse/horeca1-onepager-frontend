"use client";

import { Eye } from "lucide-react";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IoBagHandle } from "react-icons/io5";
import Cookies from "js-cookie";

//internal import
import OrderHistory from "./OrderHistory";
import useUtilsFunction from "@hooks/useUtilsFunction";
import Pagination from "@components/pagination/Pagination";

// JWT Expired Handler Component
const JWTExpiredHandler = () => {
  useEffect(() => {
    // Clear user cookies
    Cookies.remove("userInfo");
    Cookies.remove("couponInfo");
    // Redirect to login
    window.location.href = "/auth/otp-login?redirectUrl=/";
  }, []);

  return (
    <div className="text-center my-10 mx-auto w-11/12">
      <div className="animate-spin h-8 w-8 border-4 border-[#018549] border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-gray-600">Session expired, redirecting to login...</p>
    </div>
  );
};


const RecentOrder = ({ data, error, link, title }) => {
  const router = useRouter();
  const { showingTranslateValue } = useUtilsFunction();

  const handleChangePage = (page) => {
    // console.log("handleChangePage::", page);
    router.push(`?page=${page}`);
  };

  // console.log("orders", data, "title", title);

  return (
    <>
      <div className="max-w-screen-2xl mx-auto">
        <div className="rounded-md">
          {error ? (
            error.toLowerCase().includes('jwt') || error.toLowerCase().includes('expired') || error.toLowerCase().includes('unauthorized') ? (
              <JWTExpiredHandler />
            ) : (
              <h2 className="text-xl text-center my-10 mx-auto w-11/12 text-red-400">
                {error}
              </h2>
            )
          ) : data?.orders?.length === 0 ? (
            <div className="text-center">
              <span className="flex justify-center my-30 pt-16 text-[#018549] font-semibold text-6xl">
                <IoBagHandle />
              </span>
              <h2 className="font-medium text-md my-4 text-gray-600">
                You Have no order Yet!
              </h2>
            </div>
          ) : (
            <div className="flex flex-col">
              <h3 className="text-lg font-medium mb-5">
                {showingTranslateValue(title)}
              </h3>
              <div className="my-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="align-middle inline-block border border-gray-100 min-w-full pb-2 sm:px-6 lg:px-8 rounded-md">
                  <div className="overflow-hidden border-b last:border-b-0 border-gray-100 rounded-md">
                    <div className="inline-block min-w-full py-2 align-middle">
                      <div className="overflow-hidden border border-gray-100 sm:rounded-lg">
                        <table className="table-auto min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50 pb-10">
                            <tr className="bg-gray-100">
                              <th
                                scope="col"
                                className="py-3 pr-1 pl-4 text-left text-sm font-semibold text-gray-600 sm:pl-6"
                              >
                                Order ID
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-1 text-left text-sm font-semibold text-gray-600"
                              >
                                OrderTime
                              </th>

                              <th
                                scope="col"
                                className="px-3 py-1 text-left text-sm font-semibold text-gray-600"
                              >
                                Method
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-1 text-left text-sm font-semibold text-gray-600"
                              >
                                Status
                              </th>
                              {/* <th
                                scope="col"
                                className="px-3 py-1 text-left text-sm font-semibold text-gray-600"
                              >
                                Qty
                              </th> */}
                              <th
                                scope="col"
                                className="px-3 py-1 text-left text-sm font-semibold text-gray-600"
                              >
                                Shipping
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-1 text-left text-sm font-semibold text-gray-600"
                              >
                                Shipping Cost
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-1 text-left text-sm font-semibold text-gray-600"
                              >
                                Total
                              </th>
                              <th
                                scope="col"
                                className="relative text-end py-1 pr-3 pl-3 text-sm sm:pr-6 font-semibold text-gray-600"
                              >
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {data?.orders?.map((order) => (
                              <tr key={order._id}>
                                <OrderHistory order={order} />
                                <td className="px-4 text-sm whitespace-nowrap text-end">
                                  <Link href={`/order/${order._id}`}>
                                    <span className="text-[#018549] text-end cursor-pointer hover:text-[#016d3b] transition-all p-3 font-semibold rounded-full flex items-center justify-end gap-1.5">
                                      <Eye className="h-4 w-4" />
                                    </span>
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    {data?.totalDoc > 10 && (
                      <Pagination
                        totalResults={data?.totalDoc}
                        resultsPerPage={10}
                        onChange={handleChangePage}
                        label="Product Page Navigation"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RecentOrder;

