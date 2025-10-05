"use client";

import { useEffect } from "react";
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "../styles/globals.css";
import Header from "@/components/Header";

const theme = createTheme({
  primaryColor: "red",
  colors: {
    red: [
      "#ffe5e5",
      "#ffcccc",
      "#ff9999",
      "#ff6666",
      "#ff4444",
      "#ff2222",
      "#cc0000",
      "#990000",
      "#660000",
      "#330000",
    ],
  },
  defaultRadius: "md",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Force HTTPS redirect
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.protocol === "http:" &&
      window.location.hostname !== "localhost"
    ) {
      window.location.href = window.location.href.replace("http:", "https:");
    }
  }, []);

  return (
    <html lang="en">
      <body>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <Header />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
