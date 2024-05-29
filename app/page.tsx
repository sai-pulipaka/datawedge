"use client";

import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";

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
    const codeReader = new BrowserQRCodeReader();

    const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();

    // choose your media device (webcam, frontal camera, back camera, etc.)
    const selectedDeviceId = videoInputDevices[0].deviceId;

    console.log(`Started decode from camera with id ${selectedDeviceId}`);

    const previewElem = document.querySelector(
      "#test-area-qr-code-webcam"
    ) as HTMLVideoElement;

    // you can use the controls to stop() the scan or switchTorch() if available
    const controls = await codeReader.decodeFromVideoDevice(
      selectedDeviceId,
      previewElem,
      (result, error, controls) => {
        console.log({ result, error, controls });
      }
    );

    // stops scanning after 20 seconds
    setTimeout(() => controls.stop(), 20000);
  }

  return (
    <main className={styles.main}>
      {keypressoutput}
      <button onClick={startXZingScanner}>Start XZing Scanner</button>
      <video id="test-area-qr-code-webcam" style={{ width: "100%" }}></video>
    </main>
  );
}
