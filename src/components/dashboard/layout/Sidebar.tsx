import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Home, Search, Settings, HelpCircle, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  id: string;
  badge?: string;
}

interface SidebarProps {
  items: NavItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
  subscriptionTier?: string;
}

const defaultNavItems: NavItem[] = [
  { icon: <Home size={18} />, label: "Home", id: "home" },
  { icon: <Search size={18} />, label: "Search", id: "search" },
  { icon: <Settings size={18} />, label: "Settings", id: "settings" },
];

const Sidebar = ({
  items,
  activeItem,
  onItemClick,
  subscriptionTier = "Free",
}: SidebarProps) => {
  const allItems = [
    ...items,
    {
      icon: <CreditCard size={18} />,
      label: "Suscripción",
      id: "subscription",
      badge: subscriptionTier,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4">
      <nav className="space-y-2">
        {allItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
              activeItem === item.id
                ? "bg-red-50 text-red-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <Badge
                variant="outline"
                className="ml-2"
              >
                {item.badge}
              </Badge>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
