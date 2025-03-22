import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Crown, LogOut } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "../../../../supabase/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Modificamos la lógica para mostrar el CTA
  const shouldShowUpgrade =
    !subscription?.status ||
    subscription.status !== "active" ||
    subscription.plan_type?.toLowerCase() === "aprendiz";

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const renderNavItems = () => (
    <div className="space-y-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick(item.id)}
          className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
            activeItem === item.id
              ? "bg-red-100 text-red-900"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {item.icon}
          <span className="ml-3">{item.label}</span>
          {item.badge && (
            <span className="ml-auto text-xs bg-red-100 text-red-900 px-2 py-1 rounded-full">
              {item.badge}
            </span>
          )}
        </button>
      ))}

      {shouldShowUpgrade && (
        <button
          onClick={() => onItemClick("Pricing")}
          className="w-full flex items-center px-3 py-2 rounded-lg text-sm bg-gradient-to-r from-yellow-400 to-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-600 transition-colors"
        >
          <Crown className="w-4 h-4 mr-2" />
          Mejora tu Plan
        </button>
      )}
    </div>
  );

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 shrink-0">
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex-1 flex flex-col p-4">
          <ScrollArea className="flex-1">{renderNavItems()}</ScrollArea>
        </div>

        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
