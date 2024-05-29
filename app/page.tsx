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
        setKeypressoutput("enter");
      else {
        setKeypressoutput(`${keypressoutput}${e.key}`);
      }
    }
    document.addEventListener("keypress", keypressHandler);

    return () => {
      document.removeEventListener("keypress", keypressHandler);
    };
  }, [keypressoutput]);

  return <main className={styles.main}>{keypressoutput}</main>;
}
