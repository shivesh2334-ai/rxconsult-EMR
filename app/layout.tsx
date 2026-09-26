import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RxConsult — Clinic Prescription & Consultation",
  description: "Patient registry, consultation, and AI-assisted prescription tool",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-6">{children}</div>
      </body>
    </html>
  );
}
