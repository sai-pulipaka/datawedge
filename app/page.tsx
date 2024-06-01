"use client";

import styles from "./page.module.css";
import { useEffect, useState } from "react";
import {
  Html5Qrcode,
  Html5QrcodeCameraScanConfig,
  Html5QrcodeResult,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import "barcode-detector/side-effects";

export default function Home() {
  const [keypressoutput, setKeypressoutput] = useState<string>("");
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);
  const [cameraScanResult, setCameraScanResult] = useState<string>("");

  useEffect(() => {
    function keypressHandler(e: KeyboardEvent) {
      // code is empty for TC78 DataWedge keypresses events
      if (e.code !== "") {
        return;
      }

      if (e.key === "$") {
        setKeypressoutput("");
      } else {
        setKeypressoutput(`${keypressoutput}${e.key}`);
      }
    }

    document.addEventListener("keypress", keypressHandler);

    return () => {
      document.removeEventListener("keypress", keypressHandler);
    };
  }, [keypressoutput]);

  function startCameraScan() {
    const html5QrCode = new Html5Qrcode("reader", {
      verbose: false,
      useBarCodeDetectorIfSupported: true,
    });
    setHtml5QrCode(html5QrCode);
    const qrCodeSuccessCallback = async (
      decodedText: string,
      decodedResult: Html5QrcodeResult
    ) => {
      setCameraScanResult(decodedText);
      console.log({ decodedResult });
      html5QrCode.pause(true);
      try {
        navigator.vibrate(250);
      } catch (error) {}
    };
    const config: Html5QrcodeCameraScanConfig = {
      fps: 30,
    };

    // If you want to prefer back camera
    html5QrCode.start(
      { facingMode: "environment" },
      config,
      qrCodeSuccessCallback,
      () => {}
    );
  }

  return (
    <main className={styles.mainContainer}>
      <div id="reader" className={styles.cameraContainer}></div>
      <div className={styles.buttonContainer}>
        <Button variant="outline" onClick={startCameraScan}>
          Start Camera Scan
        </Button>
      </div>
      <p>{keypressoutput}</p>
      <AlertDialog open={cameraScanResult !== ""}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Barcode</AlertDialogTitle>
            <AlertDialogDescription>{cameraScanResult}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setCameraScanResult("");
                if (html5QrCode) {
                  html5QrCode.resume();
                }
              }}
            >
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
