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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

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
      icon: <User size={18} />,
      label: "Mi Cuenta",
      id: "account",
    },
    {
      icon: <CreditCard size={18} />,
      label: "Suscripción",
      id: "subscription",
      badge: subscriptionTier,
    },
  ];

  const navigate = useNavigate();

  const handleNavigation = (section: string) => {
    if (section === "My Collection") {
      navigate("/dashboard");
    }
  };

  const handleItemClick = (item: NavItem) => {
    if (item.id === "collection") {
      handleNavigation("My Collection");
    } else {
      onItemClick(item.id);
    }
  };

  const renderNavItems = (isMobile: boolean = false) => (
    <nav className="space-y-2">
      {allItems.map((item) =>
        isMobile ? (
          <SheetClose
            key={item.id}
            asChild
          >
            <button
              onClick={() => handleItemClick(item)}
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
          </SheetClose>
        ) : (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
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
        )
      )}
    </nav>
  );

  return (
    <>
      {/* Versión Desktop */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200">
        <div className="h-16" />
        <ScrollArea className="h-[calc(100vh-4rem)] p-4">
          {renderNavItems(false)}
        </ScrollArea>
      </aside>

      {/* Versión Mobile */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed left-4 top-3 z-50"
          >
            <Menu size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-64 p-0 pt-16"
        >
          <ScrollArea className="h-full p-4">{renderNavItems(true)}</ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;
