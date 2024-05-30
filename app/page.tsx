"use client";

import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { BarcodeFormat, BrowserMultiFormatReader } from "@zxing/browser";
import { DecodeHintType } from "@zxing/library";
import { Html5QrcodeResult, Html5QrcodeScanner } from "html5-qrcode";
import { Html5QrcodeError } from "html5-qrcode/esm/core";

export default function Home() {
  const [keypressoutput, setKeypressoutput] = useState<string>("");

  useEffect(() => {
    function keypressHandler(e: any) {
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
    }

    function onScanFailure(errorMessage: string, error: Html5QrcodeError) {
      // handle scan failure, usually better to ignore and keep scanning.
      // for example:
      console.warn(`Code scan error = ${errorMessage}`);
    }

    let html5QrcodeScanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    console.log({html5QrcodeScanner})
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);

    return () => {
      html5QrcodeScanner.clear();
    };
  }, []);

  return (
    <main className={styles.main}>
      {/* <button onClick={startXZingScanner}>Start Scanner</button> */}
      <div id="reader"></div>
      {/* {keypressoutput} */}
    </main>
  );
}
