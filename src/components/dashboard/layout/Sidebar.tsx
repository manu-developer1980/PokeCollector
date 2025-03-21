import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Crown } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { MobileMenu } from "@/components/shared/MobileMenu";

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
}

const Sidebar = ({ items, activeItem, onItemClick }: SidebarProps) => {
  const { subscription } = useSubscription();
  const isPremium = subscription?.status === "active";

  const renderNavItems = () => (
    <nav className="space-y-2">
      {items.map((item) => (
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
        </button>
      ))}

      {!isPremium && (
        <button
          onClick={() => onItemClick("Pricing")}
          className="w-full flex items-center px-3 py-2 rounded-lg text-sm bg-gradient-to-r from-yellow-400 to-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-600"
        >
          <Crown className="w-4 h-4 mr-2" />
          <span>Mejora tu Plan</span>
        </button>
      )}
    </nav>
  );

  return (
    <>
      {/* Versión Desktop */}
      <aside className="hidden md:block w-64 bg-white border-r border-gray-200 shrink-0">
        <div className="sticky top-16 h-auto">
          <div className="flex flex-col flex-1 p-4">
            <ScrollArea className="flex-1">{renderNavItems()}</ScrollArea>
          </div>
        </div>
      </aside>

      {/* Versión Mobile */}
      <div className="md:hidden">
        <MobileMenu
          items={items}
          activeItem={activeItem}
          onItemClick={onItemClick}
        />
      </div>
    </>
  );
};

export default Sidebar;
