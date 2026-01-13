// components/invoice/InvoicePDF.js
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";
import dayjs from "dayjs";

const tw = createTw({
  theme: {
    extend: {
      colors: {
        primary: "#018549",
        secondary: "#3f37c9",
        accent: "#4895ef",
        "indigo-50": "#eef2ff",
        "emerald-50": "#ecfdf5",
        "gray-50": "#f9fafb",
        "gray-100": "#f3f4f6",
        "gray-200": "#e5e7eb",
        "gray-500": "#6b7280",
        "gray-600": "#4b5563",
        "gray-700": "#374151",
        "red-500": "#ef4444",
        "orange-500": "#f97316",
        "indigo-500": "#6366f1",
      },
      fontSize: {
        xs: "10px",
        sm: "11px",
        base: "12px",
        lg: "14px",
        xl: "18px",
        "2xl": "22px",
      },
    },
  },
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    paddingBottom: 40,
    backgroundColor: "#ffffff",
    fontSize: 12,
  },
  header: {
    backgroundColor: "#eef2ff", // indigo-50
    padding: 30,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  footer: {
    backgroundColor: "#ecfdf5", // emerald-50
    padding: 30,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
  },
  tableHeader: {
    backgroundColor: "#f9fafb", // gray-50
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    alignItems: "center",
  },
  colSr: { width: "8%" },
  colProduct: { width: "45%" },
  colQty: { width: "15%", textAlign: "center" },
  colPrice: { width: "16%", textAlign: "center" },
  colAmount: { width: "16%", textAlign: "right" },
});

const InvoicePDF = ({ data, globalSetting }) => {
  // Use "Rs." instead of "₹" for better PDF compatibility
  const currencySymbol = globalSetting?.default_currency || "₹";
  const currency = currencySymbol === "₹" ? "Rs." : currencySymbol;
  const getNumberTwo = (num) => (!num ? "0.00" : Number(num).toFixed(2));

  // Status Color Logic
  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
      case "POS-Completed":
        return "#018549";
      case "Pending":
        return "#f97316";
      case "Cancel":
        return "#ef4444";
      case "Processing":
        return "#6366f1";
      case "Deleted":
        return "#b91c1c";
      default:
        return "#374151";
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={tw("p-8 bg-indigo-50")}>
          <View style={tw("flex flex-row justify-between items-start pb-4 border-b border-gray-200")}>
            <View>
              <Text style={tw("font-bold text-2xl uppercase text-gray-800")}>
                Invoice
              </Text>
              <View style={tw("flex flex-row mt-1")}>
                <Text style={tw("text-gray-700 text-sm")}>Status : </Text>
                <Text style={{ ...tw("text-sm"), color: getStatusColor(data?.status) }}>
                  {data?.status}
                </Text>
              </View>
            </View>
            <View style={tw("items-end")}>
              <Image
                src="https://res.cloudinary.com/dezs8ma9n/image/upload/v1766484997/horecaLogo_hirtnv.png"
                style={{ width: 100, height: 35, marginBottom: 5 }}
              />
              <Text style={tw("text-xs text-gray-500 text-right w-48")}>
                {globalSetting?.address || "Cecilia Chapman, 561-4535 Nulla LA, United States 96522"}
              </Text>
            </View>
          </View>

          <View style={tw("flex flex-row justify-between pt-4")}>
            <View style={tw("flex flex-col w-1/3")}>
              <Text style={tw("font-bold text-xs uppercase text-gray-600 mb-1")}>
                Date
              </Text>
              <Text style={tw("text-xs text-gray-500")}>
                {data?.createdAt && dayjs(data?.createdAt).format("MMMM D, YYYY")}
              </Text>
            </View>
            <View style={tw("flex flex-col w-1/3")}>
              <Text style={tw("font-bold text-xs uppercase text-gray-600 mb-1")}>
                Invoice No.
              </Text>
              <Text style={tw("text-xs text-gray-500")}>#{data?.invoice}</Text>
            </View>
            <View style={tw("flex flex-col w-1/3 items-end")}>
              <Text style={tw("font-bold text-xs uppercase text-gray-600 mb-1 text-right")}>
                Invoice To.
              </Text>
              <Text style={tw("text-xs text-gray-500 text-right")}>
                {data?.user_info?.name}
              </Text>
              <Text style={tw("text-xs text-gray-500 text-right")}>
                {data?.user_info?.email}
              </Text>
              <Text style={tw("text-xs text-gray-500 text-right")}>
                {data?.user_info?.contact}
              </Text>
              <Text style={tw("text-xs text-gray-500 text-right w-40")}>
                {data?.user_info?.address}
              </Text>
              {data?.user_info?.city && (
                <Text style={tw("text-xs text-gray-500 text-right")}>
                  {data?.user_info?.city}, {data?.user_info?.country} {data?.user_info?.zipCode}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Table Section */}
        <View style={tw("px-8 my-6")}>
          <View style={[styles.tableHeader, tw("bg-gray-50")]}>
            <Text style={[styles.colSr, tw("text-xs font-bold text-gray-700 uppercase")]}>Sr.</Text>
            <Text style={[styles.colProduct, tw("text-xs font-bold text-gray-700 uppercase pl-2")]}>Product Name</Text>
            <Text style={[styles.colQty, tw("text-xs font-bold text-gray-700 uppercase")]}>Quantity</Text>
            <Text style={[styles.colPrice, tw("text-xs font-bold text-gray-700 uppercase")]}>Item Price</Text>
            <Text style={[styles.colAmount, tw("text-xs font-bold text-gray-700 uppercase")]}>Amount</Text>
          </View>

          {data?.cart?.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.colSr, tw("text-xs text-gray-500")]}>{i + 1}</Text>
              <View style={[styles.colProduct, tw("flex flex-row items-center")]}>
                {/* Optional: Add Image here if needed, but keeping it text-only for layout safety */}
                <Text style={tw("text-xs font-medium text-gray-700 pl-2")}>{item.title}</Text>
              </View>
              <Text style={[styles.colQty, tw("text-xs text-gray-500")]}>{item.quantity}</Text>
              <View style={[styles.colPrice, tw("flex flex-col items-center")]}>
                {(() => {
                  const originalPrice = parseFloat(item.originalPrice || item.prices?.originalPrice || item.prices?.price || 0);
                  if (originalPrice > item.price) {
                    return (
                      <Text style={tw("text-[8px] text-gray-400 line-through")}>
                        {currency}{getNumberTwo(originalPrice)}
                      </Text>
                    );
                  }
                  return null;
                })()}
                <Text style={tw("text-xs font-bold text-gray-500")}>
                  {currency}{getNumberTwo(item.price)}
                </Text>
              </View>
              <Text style={[styles.colAmount, tw("text-xs font-bold text-gray-500")]}>
                {currency}{getNumberTwo(item.itemTotal)}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer Totals Section */}
        <View style={tw("border-t border-b border-gray-100 p-8 bg-emerald-50 mt-4")}>
          <View style={tw("flex flex-row justify-between mb-4")}>
            <View style={tw("flex flex-col w-1/4")}>
              <Text style={tw("font-bold text-xs uppercase text-gray-600 mb-1")}>
                Payment Method
              </Text>
              <Text style={tw("text-xs text-gray-500 font-bold")}>
                {data?.paymentMethod}
              </Text>
            </View>
            <View style={tw("flex flex-col w-1/4")}>
              <Text style={tw("font-bold text-xs uppercase text-gray-600 mb-1")}>
                Shipping Cost
              </Text>
              {data?.shippingCost === 0 || !data?.shippingCost ? (
                <Text style={tw("text-xs text-green-600 font-bold")}>FREE</Text>
              ) : (
                <Text style={tw("text-xs text-gray-500 font-bold")}>
                  {currency}{getNumberTwo(data?.shippingCost)}
                </Text>
              )}
            </View>

            <View style={tw("flex flex-col w-1/4")}>
              <Text style={tw("font-bold text-xs uppercase text-gray-600 mb-1")}>
                Discount
              </Text>
              <Text style={tw("text-xs text-gray-500 font-bold")}>
                {currency}{getNumberTwo(data?.discount)}
              </Text>
            </View>

            <View style={tw("flex flex-col w-1/4")}>
              {/* Spacer */}
            </View>
          </View>

          <View style={tw("flex flex-row justify-between pt-4 border-t border-emerald-100")}>
            <View style={tw("flex flex-col w-1/4")}>
              <Text style={tw("font-bold text-xs uppercase text-gray-600 mb-1")}>
                Taxable Subtotal
              </Text>
              <Text style={tw("text-xs text-gray-500 font-bold")}>
                {currency}{getNumberTwo(data?.taxableSubtotal)}
              </Text>
            </View>

            <View style={tw("flex flex-col w-1/4")}>
              <Text style={tw("font-bold text-xs uppercase text-gray-600 mb-1")}>
                GST
              </Text>
              <Text style={tw("text-xs text-gray-500 font-bold")}>
                {currency}{getNumberTwo(data?.totalGst)}
              </Text>
            </View>

            <View style={tw("flex flex-col w-1/4")}>
              {/* Spacer */}
            </View>

            <View style={tw("flex flex-col w-1/4")}>
              <Text style={tw("font-bold text-xs uppercase text-gray-600 mb-1")}>
                Total Amount
              </Text>
              <Text style={tw("text-xl font-bold text-red-500")}>
                {currency}{getNumberTwo(data?.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom copyright/address in Footer style usually goes here, but Invoice.jsx doesn't have it explicitly separate */}
      </Page>
    </Document>
  );
};

export default InvoicePDF;
