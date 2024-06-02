"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Page() {
  const baseURL = "https://barcode.tec-it.com/barcode.ashx?code=Code25IL";

  function generateRandomBarcodeURL() {
    const random10DigitNumber = Math.floor(
      1000000000 + Math.random() * 9000000000
    );
    return `${baseURL}&data=${random10DigitNumber}`;
  }

  const [barcodeURL, setBarcodeURL] = useState<string | undefined>();

  useEffect(() => {
    setBarcodeURL(generateRandomBarcodeURL());
    const interval = setInterval(() => {
      setBarcodeURL(generateRandomBarcodeURL());
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);


  return (
    <div style={{
        background: "white",
        display: "flex",
        justifyContent: "center",
        marginBlockStart: "50px",
        padding: "20px",
    }}>
      {barcodeURL && (
        <>
          <Image src={barcodeURL} alt="barcode" width={500} height={300} />
        </>
      )}
    </div>
  );
}
