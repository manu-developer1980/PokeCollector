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
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Primero navegar al home
      navigate("/");
      // Luego mostrar el toast
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    } catch (error) {
      console.error("Error during sign out:", error);
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const allItems = [
    ...items,
    {
      icon: <CreditCard size={18} />,
      label: "Suscripción",
      id: "subscription",
      badge: subscriptionTier,
    },
  ];

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
    <>
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
    </>
  );

  return (
    <>
      {/* Versión Desktop */}
      <aside className="hidden md:flex flex-col fixed top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-30 ">
        <div className="flex flex-col flex-1 p-4">
          <ScrollArea className="flex-1">{renderNavItems(false)}</ScrollArea>
          {/* Botón de cerrar sesión */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut
                size={18}
                className="mr-3"
              />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
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
          <div className="flex flex-col h-full p-4">
            <ScrollArea className="flex-1">{renderNavItems(true)}</ScrollArea>
            {/* Botón de cerrar sesión */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <LogOut
                  size={18}
                  className="mr-3"
                />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;
