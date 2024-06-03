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
  const [cameraScanResult, setCameraScanResult] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [scanningResults, setScanningResults] = useState<ScanningResult[]>([]);

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
      //     advanced: [{ zoom: capabilities.zoom.max / 4 }],
      //   });
      // }
      videoElement.srcObject = stream;
      console.log("stream started");
      await videoRef.current.play();
    }
  }

  useEffect(() => {
    startStream();
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    async function detectBarcode() {
      if (videoElement !== null) {
        const barcodes = await barcodeDetector.detect(videoElement);

        if (barcodes.length > 0) {
          // setCameraScanResult(barcodes[0].rawValue);
          setScanningResults((previosResults) => {
            // if barocodes are not present in the previous results, add them
            const newResults = barcodes.filter(
              (barcode) =>
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
        }

        videoElement.requestVideoFrameCallback(detectBarcode);
      }
    }

    if (videoElement) {
      videoElement.requestVideoFrameCallback(detectBarcode);
    }
  }, []);

  useEffect(() => {
    // setup pinch detection on overlay container
    const overlayElement = overlayRef.current;
    // Calculate distance between two fingers
    const distance = (event: TouchEvent) => {
      return Math.hypot(
        event.touches[0].pageX - event.touches[1].pageX,
        event.touches[0].pageY - event.touches[1].pageY
      );
    };

    if (!overlayElement) return;

    let start: any = {};

    overlayElement.addEventListener("touchstart", (event) => {
      // console.log('touchstart', event);
      if (event.touches.length === 2) {
        event.preventDefault(); // Prevent page scroll

        // Calculate where the fingers have started on the X and Y axis
        start.x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
        start.y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
        start.distance = distance(event);
      }
    });

    overlayElement.addEventListener("touchmove", (event) => {
      // console.log('touchmove', event);
      if (event.touches.length === 2) {
        event.preventDefault(); // Prevent page scroll

        // Safari provides event.scale as two fingers move on the screen
        // For other browsers just calculate the scale manually
        let scale;
        if ((event as any).scale) {
          scale = (event as any).scale;
        } else {
          const deltaDistance = distance(event);
          scale = deltaDistance / start.distance;
        }
     
        console.log({ scale });

        // Calculate how much the fingers have moved on the X and Y axis
        // const deltaX =
        //   ((event.touches[0].pageX + event.touches[1].pageX) / 2 - start.x) * 2; // x2 for accelarated movement
        // const deltaY =
        //   ((event.touches[0].pageY + event.touches[1].pageY) / 2 - start.y) * 2; // x2 for accelarated movement

        // console.log({ deltaX, deltaY });
      }
    });
  }, []);

  return (
    <main className={styles.mainContainer}>
      <div className={styles.cameraContainer}>
        <video playsInline id="stream" ref={videoRef} />
        <div ref={overlayRef} className={styles.overlayContainer}></div>
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
              {scanningResults.map((result) => {
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
