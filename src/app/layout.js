import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ApolloWrapper from "./apolloWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Frontend I-A",
  description: "Created with Next.js, React.js, ApolloClients",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
