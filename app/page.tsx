"use client";

import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { BarcodeFormat, BrowserMultiFormatReader } from "@zxing/browser";
import { DecodeHintType } from "@zxing/library";
import {
  Html5Qrcode,
  Html5QrcodeResult,
} from "html5-qrcode";
import { Html5QrcodeError } from "html5-qrcode/esm/core";

export default function Home() {
  const [keypressoutput, setKeypressoutput] = useState<string>("");
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);

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

  async function startXZingScanner() {
    const codeReader = new BrowserMultiFormatReader();
    codeReader.hints.set(DecodeHintType.TRY_HARDER, true);
    codeReader.hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.ITF]);
    codeReader.hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.CODE_128,
    ]);

    const videoInputDevices =
      await BrowserMultiFormatReader.listVideoInputDevices();
    console.log({ videoInputDevices });

    // choose your media device (webcam, frontal camera, back camera, etc.)
    const selectedDeviceId = videoInputDevices.at(-1)?.deviceId;

    console.log(`Started decode from camera with id ${selectedDeviceId}`);

    const previewElem = document.querySelector(
      "#test-area-qr-code-webcam"
    ) as HTMLVideoElement;

    // you can use the controls to stop() the scan or switchTorch() if available
    const controls = await codeReader.decodeFromVideoDevice(
      selectedDeviceId,
      previewElem,
      (result, _, controls) => {
        if (result !== undefined) {
          navigator.vibrate(1000);
          setKeypressoutput(result.getText());
          controls.stop();
        }
      }
    );

    // stops scanning after 20 seconds
    setTimeout(() => controls.stop(), 20000);
  }

  useEffect(() => {
    function onScanSuccess(
      decodedText: string,
      decodedResult: Html5QrcodeResult
    ) {
      // handle the scanned code as you like, for example:
      alert(decodedText);
      navigator.vibrate(300);
    }

    // handle scan failure, usually better to ignore and keep scanning.
    function onScanFailure(errorMessage: string, error: Html5QrcodeError) {}

    // let html5QrcodeScanner = new Html5QrcodeScanner(
    //   "reader",
    //   { fps: 10, qrbox: { width: 250, height: 250 } },
    //   /* verbose= */ false
    // );

    // html5QrcodeScanner.render(onScanSuccess, onScanFailure);

    return () => {
      // html5QrcodeScanner.clear();
    };
  }, []);

  function startCameraScan(): void {
    const html5QrCode = new Html5Qrcode("reader");
    setHtml5QrCode(html5QrCode);
    const qrCodeSuccessCallback = (
      decodedText: string
      // decodedResult: Html5QrcodeResult
    ) => {
      setTimeout(() => {
        alert(decodedText);
      }, 100);
      navigator.vibrate(250);
      html5QrCode.stop();
      html5QrCode.clear();
    };
    const config = { fps: 10 };

    // If you want to prefer back camera
    html5QrCode.start(
      { facingMode: "environment" },
      config,
      qrCodeSuccessCallback,
      () => {}
    );
  }

  return (
    <main className={styles.main}>
      <div id="reader"></div>
      <button className={styles.button} onClick={startCameraScan}>
        Start Camera Scan
      </button>
      <button
        className={styles.button}
        onClick={() => {
          if (html5QrCode) {
            html5QrCode.stop();
            html5QrCode.clear();
          }
        }}
      >
        Stop Camera Scan
      </button>
      <p>{keypressoutput}</p>
    </main>
  );
}
