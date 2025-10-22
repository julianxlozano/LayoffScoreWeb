"use client";

import Link from "next/link";
import { Group } from "@mantine/core";
import styles from "./Header.module.css";
import ShieldBadge from "@/components/ShieldBadge";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Group justify="space-between" h="100%">
          <Link href="/" className={styles.logo}>
            <div className={styles.logoBadge}>
              <ShieldBadge size={30} />
            </div>
            <span className={styles.logoText}>LayoffScore</span>
          </Link>
        </Group>
      </div>
    </header>
  );
}
