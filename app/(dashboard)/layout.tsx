import Navbar from "@/components/navbar";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Dashboard | Nexora",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative" >
      <Navbar />
      <div className=" mt-[70px] px-6 max-md:px-2">
        {/* <Tabs /> */}
        {children}
      </div>
    </main>
  );
}
