"use client";

import styles from "./page.module.css";
import {
  PropsWithChildren,
  createContext,
  use,
  useEffect,
  useRef,
  useState,
} from "react";
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

const barcodeDetector = new BarcodeDetectorWASM({ formats: ["itf"] });

type ScanningResult = {
  barcode: string;
  format: string;
};

export default function Home() {
  const [keypressoutput, setKeypressoutput] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [scanningResults, setScanningResults] = useState<ScanningResult[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

  async function startStream(): Promise<void> {
    if (videoRef.current !== null) {
      const videoElement = videoRef.current;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: 1280,
          height: 720,
        },
      });
      const [videoTrack] = stream.getVideoTracks();
      const capabilities = videoTrack.getCapabilities();
      // @ts-ignore
      // if (capabilities.zoom) {
      //   await videoTrack.applyConstraints({
      //     // @ts-ignore
      //     advanced: [{ zoom: capabilities.zoom.max }],
      //   });
      // }
      videoElement.srcObject = stream;
      await videoRef.current.play();
    }
  }

  useEffect(() => {
    startStream();
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    async function detectBarcode() {
      // clear the canvas
      const canvas = canvasRef.current;
      let canvasContext = canvas?.getContext("2d");
      if (canvasContext && canvas) {
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      }
      if (videoElement !== null) {
        const barcodes = await barcodeDetector.detect(videoElement);

        if (barcodes.length > 0) {
          // setCameraScanResult(barcodes[0].rawValue);
          setScanningResults((previosResults) => {
            // if barocodes are not present in the previous results, add them
            const newResults = barcodes.filter(
              (barcode) =>
                barcode.rawValue.length === 10 &&
                !previosResults.some(
                  (previousResult) =>
                    previousResult.barcode === barcode.rawValue
                )
            );
            return [
              ...previosResults,
              ...newResults.map((barcode) => ({
                barcode: barcode.rawValue,
                format: barcode.format,
              })),
            ];
          });

          if (canvas) {
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            if (canvasContext) {
              canvasContext.clearRect(0, 0, canvas.width, canvas.height);
              canvasContext.strokeStyle = "red";
              barcodes.forEach((barcode) => {
                const { x, y, width, height } = barcode.boundingBox;
                canvasContext.strokeRect(x, y, width, height);
                // write the barcode value inside the bounding box
                canvasContext.font = "16px Arial";
                canvasContext.fillStyle = "red";
                canvasContext.fillText(barcode.rawValue, x, y - 10);
              });
            }
          }
        }

        videoElement.requestVideoFrameCallback(detectBarcode);
      }
    }

    if (videoElement) {
      videoElement.requestVideoFrameCallback(detectBarcode);
    }
  }, []);

  return (
    <main className={styles.mainContainer}>
      <div className={styles.cameraContainer}>
        <video playsInline id="stream" ref={videoRef} />
        <canvas ref={canvasRef} id="canvas" />
      </div>
      <div className={styles.resultContainer}>
        <div className="my-6 w-full overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="m-0 border-t p-0 even:bg-muted">
                <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                  Barcode
                </th>
                <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                  Format
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from(new Set(scanningResults)).map((result) => {
                return (
                  <tr
                    key={result.barcode}
                    className="m-0 border-t p-0 even:bg-muted"
                  >
                    <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                      {result.barcode}
                    </td>
                    <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                      {result.format}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* <div className={styles.buttonContainer}>
        <Button variant="outline" onClick={startStream}>
          Start Camera Scan
        </Button>
      <p>{keypressoutput}</p>
      </div> */}
      {/* <AlertDialog open={cameraScanResult !== ""}>
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
      </AlertDialog> */}
    </main>
  );
}
