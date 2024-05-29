"use client";

import styles from "./page.module.css";
import { useEffect, useState } from "react";

export default function Home() {
  const [keypressoutput, setKeypressoutput] = useState<string>("");

  useEffect(() => {
    function keypressHandler(e: any) {
      console.log("pressed: " + e.keyCode);
      if (e.keyCode == 13)
        //  Enter key from DataWedge
        setKeypressoutput("");
      else {
        setKeypressoutput(`${keypressoutput}${e.key}`);
      }
    }

    function keyupHandler(e: any) {
      console.log("up: " + e.keyCode);
    }
    function keydownHandler(e: any) {
      console.log("down: " + e.keyCode);
    }

    document.addEventListener("keypress", keypressHandler);
    document.addEventListener("keyup", keyupHandler);
    document.addEventListener("keydown", keydownHandler);

    return () => {
      document.removeEventListener("keypress", keypressHandler);
      document.removeEventListener("keyup", keyupHandler);
      document.removeEventListener("keydown", keydownHandler);
    };
  }, [keypressoutput]);

  return <main className={styles.main}>{keypressoutput}</main>;
}
