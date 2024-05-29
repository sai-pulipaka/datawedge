"use client";

import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { BarcodeFormat, BrowserMultiFormatReader } from "@zxing/browser";
import { DecodeHintType } from "@zxing/library";

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

  return (
    <main className={styles.main}>
      <button onClick={startXZingScanner}>Start Scanner</button>
      <video id="test-area-qr-code-webcam" style={{ width: "100%" }}></video>
      {keypressoutput}
    </main>
  );
}
