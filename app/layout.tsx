"use client";

import { useEffect } from "react";
import Script from "next/script";
import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "../styles/globals.css";
import Header from "@/components/Header";

const GA_MEASUREMENT_ID = "G-NH7YX4KQN6";

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
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>

        <MantineProvider theme={theme} defaultColorScheme="dark">
          <Notifications position="top-center" zIndex={2000} />
          <Header />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
