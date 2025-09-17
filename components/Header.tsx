"use client";

import { Group } from "@mantine/core";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Group justify="space-between" h="100%">
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⚡</span>
            <span className={styles.logoText}>LayoffScore</span>
          </div>
        </Group>
      </div>
    </header>
  );
}
