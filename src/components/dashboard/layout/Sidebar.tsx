import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut } from "lucide-react";
import { useAuth } from "../../../../supabase/auth";
import { useNavigate } from "react-router-dom";

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
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleItemClick = (item: NavItem) => {
    if (item.id === "logout") {
      handleSignOut();
    } else {
      onItemClick(item.id);
    }
  };

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 shrink-0">
      <div className="flex flex-col h-[calc(100vh-4rem)] sticky top-16">
        <div className="flex-1 p-4">
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                    item.id === "logout"
                      ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                      : activeItem === item.id
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
            </div>
          </ScrollArea>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
