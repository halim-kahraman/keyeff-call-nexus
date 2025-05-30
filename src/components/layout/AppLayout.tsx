
import React from "react";
import { SideNav } from "./SideNav";
import { Header } from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileNav } from "./MobileNav";

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
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex min-h-screen bg-background flex-col">
        <MobileNav />
        <Header 
          title={title} 
          subtitle={subtitle} 
          showCallButton={showCallButton}
          onCallButtonClick={onCallButtonClick}
        />
        <div className="p-4 flex-grow">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SideNav />
      <main className="flex flex-col flex-grow w-full ml-64">
        <Header 
          title={title} 
          subtitle={subtitle} 
          showCallButton={showCallButton}
          onCallButtonClick={onCallButtonClick}
        />
        <div className="p-4 md:p-6 flex-grow">{children}</div>
      </main>
    </div>
  );
};
