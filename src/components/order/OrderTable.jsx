import React from "react";

//internal imports

import useUtilsFunction from "@hooks/useUtilsFunction";
import ImageWithFallback from "@components/common/ImageWithFallBack";

const OrderTable = ({ data, currency, drawer }) => {
  const { getNumberTwo } = useUtilsFunction();

  return (
    <tbody className="divide-y divide-gray-100">
      {data?.cart?.map((item, i) => (
        <tr key={i}>
          <th className="px-6 py-2 text-sm font-normal text-gray-500 text-left">
            {i + 1}{" "}
          </th>
          <td className="px-6 py-2 text-sm font-normal text-gray-500">
            <div className="flex items-center justify-start gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-gray-200">
                <ImageWithFallback
                  img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-medium text-gray-700">{item.title}</span>
            </div>
          </td>
          <td className="px-6 py-2 text-sm text-center text-gray-500">
            {item.quantity}{" "}
          </td>
          <td className="px-6 py-2 text-sm font-medium text-center text-gray-500">
            <div className="flex flex-col items-center">
              {(() => {
                const originalPrice = parseFloat(item.originalPrice || item.prices?.originalPrice || item.prices?.price || 0);
                if (originalPrice > item.price) {
                  return (
                    <span className="text-[10px] text-gray-400 line-through">
                      {currency}{getNumberTwo(originalPrice)}
                    </span>
                  );
                }
                return null;
              })()}
              <span>
                {currency}{getNumberTwo(item.price)}
              </span>
            </div>
          </td>

          <td className="px-6 py-2 text-sm text-right font-semibold text-gray-500">
            {currency}
            {getNumberTwo(item.itemTotal)}
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default OrderTable;

