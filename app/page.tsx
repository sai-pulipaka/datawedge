"use client";

import styles from "./page.module.css";
import { useEffect, useRef, useState } from "react";
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
import { BarcodeDetector as BarcodeDetectorWASM } from "barcode-detector/pure";

function createBarcodeDetector() {
  if (typeof window === "undefined") {
    return null;
  }
  if ((window as any).BarcodeDetector) {
    return new (window as any).BarcodeDetector();
  } else {
    return new BarcodeDetectorWASM();
  }
}

const barcodeDetector = createBarcodeDetector();

export default function Home() {
  const [keypressoutput, setKeypressoutput] = useState<string>("");
  const [cameraScanResult, setCameraScanResult] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

  async function startStream() {
    if (videoRef.current !== null) {
      const videoElement = videoRef.current;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
      });
      videoElement.srcObject = stream;
      console.log("stream started");
      await videoRef.current.play();
    }
  }

  useEffect(() => {
    const videoElement = videoRef.current;
    async function detectBarcode() {
      if (videoElement !== null) {
        const barcodes = await barcodeDetector.detect(videoElement);
        if (barcodes.length > 0) {
          videoElement.pause();
          setCameraScanResult(barcodes[0].rawValue);
        }
      }
    }

    if (videoElement) {
      videoElement.addEventListener("timeupdate", detectBarcode);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("timeupdate", detectBarcode);
      }
    };
  }, []);

  return (
    <main className={styles.mainContainer}>
      <div className={styles.cameraContainer}>
        <video id="stream" ref={videoRef} />
      </div>
      <div className={styles.buttonContainer}>
        <Button variant="outline" onClick={startStream}>
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
                if (videoRef.current !== null) {
                  videoRef.current.play();
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
