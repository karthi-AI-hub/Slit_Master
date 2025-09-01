import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
// import { Dashboard } from "./Dashboard";
import { ReelInventory } from "./ReelInventory";
import { FanSizes } from "./FanSizes";
import { BottomSizes } from "./BottomSizes";
import { SlitPlanner } from "./SlitPlanner";
import { SheetCalculator } from "./SheetCalculator";

export const Layout = () => {
  const [activeTab, setActiveTab] = useState("inventory");

  const renderContent = () => {
    switch (activeTab) {
      // case "dashboard":
      //   return <Dashboard />;
      case "inventory":
        return <ReelInventory />;
      case "fan-sizes":
        return <FanSizes />;
      case "bottom-sizes":
        return <BottomSizes />;
      case "slit-planner":
        return <SlitPlanner />;
      case "sheet-calculator":
        return <SheetCalculator />;
      default:
        return <ReelInventory />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-gradient-subtle flex flex-col md:flex-row">
        <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col min-h-screen md:ml-64">
          <header className="h-16 border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-40 shadow-sm flex items-center w-full px-2 sm:px-4 md:px-6">
            <div className="flex items-center justify-center h-full w-full relative">
              <button
                className="block md:hidden bg-white border rounded-lg p-2 shadow-md mr-2 absolute left-0 top-1/2 -translate-y-1/2"
                aria-label="Open sidebar"
                onClick={() => {
                  const event = new CustomEvent('open-mobile-sidebar');
                  window.dispatchEvent(event);
                }}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              <div className="w-full flex justify-center">
                <h1 className="text-xl font-bold text-foreground text-center">
                  Shakthi Innovative Crafts : Slit Master
                </h1>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 p-2 sm:p-4 md:p-6 overflow-auto w-full">
            <div className="max-w-7xl mx-auto w-full">{renderContent()}</div>
          </div>

          {/* Footer */}
          <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm px-2 sm:px-4 md:px-6">
            <div className="py-4">
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  © 2025 Shakthi Innovative Crafts. Manufacturing Management
                  System.
                </p>
                {/* <p className="mt-1">Data stored locally in browser. Export regularly for backup.</p> */}
              </div>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};
