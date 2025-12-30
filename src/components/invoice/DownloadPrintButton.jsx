"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Download } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";

// internal imports
import Invoice from "@components/invoice/Invoice";
import { Button } from "@components/ui/button";
import { useSetting } from "@context/SettingContext";
import useUtilsFunction from "@hooks/useUtilsFunction";
import InvoicePDF from "@components/invoice/InvoiceForDownload";

const DownloadPrintButton = ({ data }) => {
  const { globalSetting, storeCustomization } = useSetting();
  const targetRef = useRef(null);
  const { showingTranslateValue } = useUtilsFunction();
  const dashboard = storeCustomization?.dashboard;

  // Flag to only render PDFDownloadLink after client mount
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // console.log("globalSetting", globalSetting, "data", data);

  return (
    <>
      <div className="bg-emerald-100 rounded-md mb-5 px-4 py-3">
        <label>
          {showingTranslateValue(dashboard?.invoice_message_first)}{" "}
          <span className="font-bold text-[#018549]">
            {data?.user_info?.name},
          </span>{" "}
          {showingTranslateValue(dashboard?.invoice_message_last)}
        </label>
      </div>

      <Invoice data={data} printRef={targetRef} globalSetting={globalSetting} />

      <div className="bg-white rounded-lg shadow-sm">
        <div className="bg-white p-8 rounded-b-xl">
          <div className="flex justify-center invoice-btn">
            {isClient && (
              <PDFDownloadLink
                document={
                  <InvoicePDF data={data} globalSetting={globalSetting} />
                }
                fileName={`Invoice-${data.invoice}.pdf`}
              >
                {({ loading }) => (
                  <Button variant="create" className="px-8 py-3 text-base font-semibold">
                    {loading ? "Generating..." : "Download Invoice"}{" "}
                    <Download className="ml-2 w-5 h-5" />
                  </Button>
                )}
              </PDFDownloadLink>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(DownloadPrintButton), {
  ssr: false,
});

