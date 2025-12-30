import React, { useContext, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useReactToPrint } from "react-to-print";
import { CreditCard, Download, Printer, Truck, X } from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

//internal import
import MainDrawer from "./MainDrawer";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { SidebarContext } from "@context/SidebarContext";
import { useSetting } from "@context/SettingContext";
import OrderItems from "@components/order/OrderItems";
import { Button } from "@components/ui/button";
import Invoice from "@components/invoice/Invoice";

const OrderDetailsDrawer = ({ data }) => {
  const printRef = useRef();
  const invoiceRef = useRef();
  const { drawerOpen, closeDrawer } = useContext(SidebarContext);
  const { globalSetting, storeCustomization } = useSetting();
  const { showingTranslateValue, getNumberTwo, currency } = useUtilsFunction();
  const [downloadLoading, setDownloadLoading] = useState(false);

  const dashboard = storeCustomization?.dashboard;

  const handlePrintInvoice = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Invoice-${data?.invoice}`,
  });

  // Download PDF using html-to-image + jsPDF (same format as print)
  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    setDownloadLoading(true);
    try {
      // Convert the invoice HTML to image
      const dataUrl = await toPng(invoiceRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice-${data?.invoice}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <MainDrawer open={drawerOpen} onClose={closeDrawer}>
      <div className="flex flex-col w-full h-full justify-between items-middle bg-white rounded">
        {/* Sticky Header */}
        <div className="flex-none w-full flex justify-between items-center relative px-5 py-4 border-b bg-indigo-50 border-gray-100">
          <div className="flex flex-col">
            <h2 className="font-semibold text-lg m-0 text-heading flex items-center">
              Invoice No #{data?.invoice}
            </h2>

            <div className="text-sm">
              {(data.status === "Delivered" ||
                data?.status === "delivered") && (
                  <span className="flex items-center gap-x-2 justify-start">
                    <div className="flex-none rounded-full bg-green-400/10 p-1 text-green-400">
                      <div className="size-2.5 rounded-full bg-current"></div>
                    </div>
                    <span className="block">{data.status}</span>
                  </span>
                )}
              {(data.status === "Pending" || data?.status === "pending") && (
                <span className="flex items-center gap-x-2 justify-start">
                  <div className="flex-none rounded-full bg-orange-400/10 p-1 text-orange-400">
                    <div className="size-2.5 rounded-full bg-current"></div>
                  </div>
                  <span className="block">{data.status}</span>
                </span>
              )}
              {(data.status === "Cancel" || data.status === "cancel") && (
                <span className="flex items-center gap-x-2 justify-start">
                  <div className="flex-none rounded-full bg-red-400/10 p-1 text-red-400">
                    <div className="size-2.5 rounded-full bg-current"></div>
                  </div>
                  <span className="block">{data.status}</span>
                </span>
              )}
              {(data.status === "Processing" ||
                data.status === "processing") && (
                  <span className="flex items-center gap-x-2 justify-start">
                    <div className="flex-none rounded-full bg-emerald-400/10 p-1 text-emerald-400">
                      <div className="size-2.5 rounded-full bg-current"></div>
                    </div>
                    <span className="block">{data.status}</span>
                  </span>
                )}
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="inline-flex print:hidden text-base items-center cursor-pointer justify-center text-gray-500 p-2 focus:outline-none transition-opacity hover:text-red-400"
          >
            <X />
            <span className="font-sens text-sm text-gray-500 hover:text-red-400 ml-1">
              Close
            </span>
          </button>
        </div>

        {/* Scrollable Invoice Content */}
        <div className="flex-1 w-full overflow-y-auto scrollbar-hide">
          <div ref={invoiceRef} className="bg-white">
            <Invoice data={data} globalSetting={globalSetting} />
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex-none bg-neutral-50 dark:bg-slate-900 p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="flex space-x-3 flex-wrap justify-between gap-2">
            <Button
              variant="create"
              onClick={handleDownloadPDF}
              disabled={downloadLoading}
            >
              {downloadLoading ? "Generating..." : "Download PDF"}{" "}
              <Download className="ml-2" />
            </Button>

            <Button onClick={handlePrintInvoice} variant="import">
              {showingTranslateValue(dashboard?.print_button) || "Print"}{" "}
              <span className="ml-2">
                <Printer />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </MainDrawer>
  );
};

export default dynamic(() => Promise.resolve(OrderDetailsDrawer), {
  ssr: false,
});
