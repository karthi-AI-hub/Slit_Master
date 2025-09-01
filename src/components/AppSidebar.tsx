
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Package, Layers, Circle, Calculator, Scissors, Trash2, Menu } from "lucide-react";
import { clearAllData } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const menu = [
  { label: "Reel Inventory", icon: Package, id: "inventory" },
  { label: "Fan Sizes", icon: Layers, id: "fan-sizes" },
  { label: "Bottom Sizes", icon: Circle, id: "bottom-sizes" },
  { label: "Slit Planner", icon: Scissors, id: "slit-planner" },
  { label: "Sheet Calculator", icon: Calculator, id: "sheet-calculator" },
];

export function AppSidebar({ activeTab, setActiveTab }) {
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setMobileOpen(true);
    window.addEventListener('open-mobile-sidebar', handler);
    return () => window.removeEventListener('open-mobile-sidebar', handler);
  }, []);

  const handleClearAllData = () => {
    clearAllData();
    toast({
      title: "Data Cleared",
      description: "All data has been cleared from browser storage",
      variant: "default"
    });
    window.location.reload();
  };

  // Sidebar content as a component for reuse
  const SidebarContent = (
    <>
      <div className="pt-6 pb-4 flex flex-col items-center">
        <img src="/logo.png" alt="Logo" className="w-20 h-14 object-contain mb-2" />
        <h1 className="text-lg font-bold text-foreground">Shakthi</h1>
        <p className="text-xs text-muted-foreground">Innovative Crafts</p>
      </div>
      <nav className="flex flex-col gap-0 px-4 flex-1">
        <ul className="flex flex-col gap-4">
          {menu.map(({ label, icon: Icon, id }) => (
            <li key={label}>
              <NavLink
                to={"#"}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition font-medium text-base
                  ${activeTab === id ? 'bg-primary text-primary-foreground shadow-md' : 'text-black hover:bg-muted/80 hover:text-foreground'}
                `}
                onClick={() => {
                  setActiveTab(id);
                  setMobileOpen(false);
                }}
              >
                <Icon size={22} className="text-inherit" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-4 pb-6 mt-auto">
        <button
          onClick={handleClearAllData}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-base bg-red-50 text-red-700 hover:bg-red-100 transition"
        >
          <Trash2 size={20} />
          Clear All Data
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden md:flex w-64 h-screen min-h-screen fixed inset-y-0 bg-white border-r flex-col overflow-y-auto z-40">
        {SidebarContent}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar overlay"
          />
          <aside className="relative w-64 h-screen min-h-screen bg-white border-r flex flex-col overflow-y-auto animate-slide-in-left shadow-xl z-50">
            <button
              className="absolute top-4 right-4 z-50 bg-white border rounded-lg p-1 shadow"
              aria-label="Close sidebar"
              onClick={() => setMobileOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}