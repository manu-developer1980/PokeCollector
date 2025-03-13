import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Home, Search, Settings, HelpCircle } from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  isActive?: boolean;
}

interface SidebarProps {
  items?: NavItem[];
  activeItem?: string;
  onItemClick?: (label: string) => void;
}

const defaultNavItems: NavItem[] = [
  { icon: <Home size={18} />, label: "Home" },
  { icon: <Search size={18} />, label: "Search", isActive: true },
  { icon: <Settings size={18} />, label: "Settings" },
];

const Sidebar = ({
  items = defaultNavItems,
  activeItem = "Search",
  onItemClick = () => {},
}: SidebarProps) => {
  return (
    <div className="w-[240px] h-full border-r border-gray-200 bg-white flex flex-col">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-1">Menu</h2>
        <p className="text-sm text-gray-500">Navigation</p>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {items.map((item) => (
            <Button
              key={item.label}
              variant={item.label === activeItem ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onItemClick(item.label)}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => onItemClick("Help")}
        >
          <HelpCircle size={18} />
          <span className="ml-2">Help</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
