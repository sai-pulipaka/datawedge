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
import {
  BarcodeDetector as BarcodeDetectorWASM,
  setZXingModuleOverrides,
} from "barcode-detector/pure";
import { beep } from "@/lib/beep";
import { BaggageJourneyInfo } from "@/lib/types";
import {
  Tooltip,
  TooltipWithBounds,
  useTooltip,
  useTooltipInPortal,
  defaultStyles,
} from "@visx/tooltip";

setZXingModuleOverrides({
  locateFile: () => {
    return "/barcode_reader.wasm";
  },
});

const barcodeDetector = new BarcodeDetectorWASM({ formats: ["itf"] });

type ScanningResult = {
  barcode: string;
  format: string;
};

type TooltipData = string;

const tooltipStyles = {
  ...defaultStyles,
  backgroundColor: "rgba(53,71,125,0.8)",
  color: "white",
  width: 152,
  height: 72,
  padding: 12,
  fontSize: 20,
};

export default function Home() {
  const [keypressoutput, setKeypressoutput] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [scanningResults, setScanningResults] = useState<ScanningResult[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    showTooltip,
    hideTooltip,
    tooltipOpen,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<TooltipData>();

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

            if (newResults.length > 0) {
              try {
                navigator.vibrate(200);
                // make a beep sound
                beep();
              } catch (error) {}
            }

            newResults.forEach((barcode) => {
              fetch(
                `https://apis.qa.alaskaair.com/aag/1/guestservices/baggagemanagement/baggagejourney/bags/${barcode.rawValue}`,
                {
                  headers: {
                    "Ocp-Apim-Subscription-Key":
                      "77916b3c9e2f4e2cbdec7c498ebf6fd9",
                  },
                }
              )
                .then((res) => res.json() as Promise<BaggageJourneyInfo[]>)
                .then(console.log);
            });

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
              // clear the canvas
              canvasContext.clearRect(0, 0, canvas.width, canvas.height);
              canvasContext.strokeStyle = "red";
              canvasContext.lineWidth = 4;
              barcodes.forEach((barcode) => {
                const { x, y, width, height } = barcode.boundingBox;
                canvasContext.strokeRect(x, y, width, height);
                canvasContext.font = "16px Arial";
                canvasContext.fillStyle = "red";
                canvasContext.fillText(barcode.rawValue, x, y);

                showTooltip({
                  tooltipLeft: x,
                  tooltipTop: y,
                  tooltipData: barcode.rawValue,
                });
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

      <TooltipWithBounds
        key={Math.random()} // needed for bounds to update correctly
        left={tooltipLeft}
        top={tooltipTop}
        style={tooltipStyles}
      >
        {tooltipData}
        <br />
        <br />
      </TooltipWithBounds>
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
