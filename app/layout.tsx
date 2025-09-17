import type { Metadata } from "next";
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "../styles/globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "LayoffScore - Secure Your Future Against AI",
  description:
    "Gain peace of mind in the age of automation. Assess your job's AI risk and future-proof your career.",
};

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
