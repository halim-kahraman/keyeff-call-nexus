
import React, { useState } from "react";
import { SideNav } from "./SideNav";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showCallButton?: boolean;
  onCallButtonClick?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title,
  subtitle,
  showCallButton,
  onCallButtonClick
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <SideNav collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className={cn(
        "flex flex-col flex-grow transition-all duration-300",
        sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
      )}>
        <Header 
          title={title} 
          subtitle={subtitle} 
          showCallButton={showCallButton}
          onCallButtonClick={onCallButtonClick}
        />

        <div className="p-6 flex-grow">{children}</div>
      </main>
    </div>
  );
};
