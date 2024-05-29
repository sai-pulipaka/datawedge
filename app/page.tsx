"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";

export default function Home() {
  const [device, setDevice] = useState<string>("");
  useEffect(() => {
    console.log(window.navigator);
    setDevice(window.navigator.userAgent);
  }, []);
  return <main className={styles.main}>{device}</main>;
}
