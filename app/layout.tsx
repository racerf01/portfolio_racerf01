import Header from "@/components/header";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ilia Poliakman // Frontend Developer",
  description: "I'm a dynamic and creative individual who thrives in the worlds of design and development. With a robust background in front-end development and identity design, I bring a unique blend of technical expertise and creative flair to every project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-950 h-[5000px]`}>
        <div className="bg-[#fbe2e3] relative top-[-6rem] right-[11rem] h-[31.25rem] w-[31.25rem] -z-10 rounded-full blur-[10rem] sm:w-[68.75rem]"></div>

        <div className="bg-[#dbd7fb] absolute top-[-6rem] left-[-35rem] h-[31.25rem] w-[50rem] -z-10 rounded-full blur-[10rem] sm:w-[68.75rem] md:left-[-33rem] lg:left-[-28rem] xl:left-[-15rem] 2xl:left-[-5rem]"></div>

        <Header />
        {children}
      </body>
    </html>
  );
}
