import React, { useContext, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useReactToPrint } from "react-to-print";
import { CreditCard, Download, Printer, Truck, X, Share2 } from "lucide-react";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";

//internal import
import MainDrawer from "./MainDrawer";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { SidebarContext } from "@context/SidebarContext";
import { useSetting } from "@context/SettingContext";
import OrderItems from "@components/order/OrderItems";
import { Button } from "@components/ui/button";
import Invoice from "@components/invoice/Invoice";
import InvoicePDF from "@components/invoice/InvoiceForDownload";

const OrderDetailsDrawer = ({ data }) => {
  const printRef = useRef();
  const invoiceRef = useRef();
  const { drawerOpen, closeDrawer } = useContext(SidebarContext);
  const { globalSetting, storeCustomization } = useSetting();
  const { showingTranslateValue, getNumberTwo, currency } = useUtilsFunction();
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const dashboard = storeCustomization?.dashboard;

  // Check if client-side and detect mobile
  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePrintInvoice = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Invoice-${data?.invoice}`,
  });

  // Mobile-friendly print using PDF blob and share API
  const handleMobilePrint = async () => {
    setDownloadLoading(true);
    try {
      // Generate PDF blob
      const pdfBlob = await pdf(
        <InvoicePDF data={data} globalSetting={globalSetting} />
      ).toBlob();

      const fileName = `Invoice-${data?.invoice}.pdf`;

      // Check if Web Share API is available (preferred for mobile)
      if (navigator.share && navigator.canShare) {
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Invoice #${data?.invoice}`,
            text: 'Your order invoice',
          });
          setDownloadLoading(false);
          return;
        }
      }

      // Fallback: Open PDF in new tab for printing
      const url = URL.createObjectURL(pdfBlob);
      const newWindow = window.open(url, '_blank');
      if (newWindow) {
        newWindow.addEventListener('load', () => {
          setTimeout(() => {
            newWindow.print();
          }, 500);
        });
      }
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error("Error with mobile print:", error);
      // Final fallback: download the PDF
      try {
        const pdfBlob = await pdf(
          <InvoicePDF data={data} globalSetting={globalSetting} />
        ).toBlob();
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice-${data?.invoice}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (fallbackError) {
        console.error("Fallback download failed:", fallbackError);
      }
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
            {/* Download PDF Button - Uses @react-pdf/renderer for mobile compatibility */}
            {isClient && (
              <PDFDownloadLink
                document={<InvoicePDF data={data} globalSetting={globalSetting} />}
                fileName={`Invoice-${data?.invoice}.pdf`}
              >
                {({ loading, error }) => (
                  <Button variant="create" disabled={loading}>
                    {loading ? "Generating..." : "Download PDF"}{" "}
                    <Download className="ml-2" />
                  </Button>
                )}
              </PDFDownloadLink>
            )}

            {/* Print Button - Different handling for mobile vs desktop */}
            <Button
              onClick={isMobile ? handleMobilePrint : handlePrintInvoice}
              variant="import"
              disabled={downloadLoading}
            >
              {downloadLoading ? "Preparing..." : (showingTranslateValue(dashboard?.print_button) || "Print")}{" "}
              <span className="ml-2">
                {isMobile ? <Share2 /> : <Printer />}
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
