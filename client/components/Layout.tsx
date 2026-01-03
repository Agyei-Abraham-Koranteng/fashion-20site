import Navbar from "./Navbar";
import Footer from "./Footer";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen pt-14 md:pt-16">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
