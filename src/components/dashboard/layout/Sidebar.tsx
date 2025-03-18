import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  Search,
  Settings,
  HelpCircle,
  CreditCard,
  Menu,
  X,
  User,
  LogOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useAuth } from "../../../../supabase/auth";
import { useToast } from "@/components/ui/use-toast";

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

const defaultNavItems: NavItem[] = [
  { icon: <Home size={18} />, label: "Home", id: "home" },
  { icon: <Search size={18} />, label: "Search", id: "search" },
  { icon: <Settings size={18} />, label: "Settings", id: "settings" },
];

const Sidebar = ({ items, activeItem, onItemClick }: SidebarProps) => {
  const renderNavItems = (isMobile: boolean = false) => (
    <nav className="space-y-2">
      {items.map((item) =>
        isMobile ? (
          <SheetClose
            key={item.id}
            asChild
          >
            <button
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
          </SheetClose>
        ) : (
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
        )
      )}
    </nav>
  );

  return (
    <>
      {/* Versión Desktop */}
      <aside className="hidden md:block w-64 bg-white border-r border-gray-200 shrink-0">
        <div className="sticky top-16 h-auto">
          <div className="flex flex-col flex-1 p-4">
            <ScrollArea className="flex-1">{renderNavItems(false)}</ScrollArea>
          </div>
        </div>
      </aside>

      {/* Versión Mobile */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="md:hidden">
            {/* Botón del menú móvil si lo necesitas */}
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-64 p-0 pt-16 block md:hidden"
        >
          <div className="flex flex-col h-full p-4">
            <ScrollArea className="flex-1">{renderNavItems(true)}</ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;
