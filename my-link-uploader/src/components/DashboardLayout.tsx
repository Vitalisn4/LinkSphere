import { ReactNode } from "react";
import Layout from "./Layout";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <Layout>{children}</Layout>;
} 