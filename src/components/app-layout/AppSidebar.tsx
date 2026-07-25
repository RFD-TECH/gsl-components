import type { ReactNode } from "react";

export interface AppSidebarProps {
  children?: ReactNode;
  className?: string;
}

export const AppSidebar = ({ children }: AppSidebarProps) => {
  return <>{children}</>;
};

(AppSidebar as unknown as { componentId: string }).componentId = "AppSidebar";
