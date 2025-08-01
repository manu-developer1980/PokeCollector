import React, { useState, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../../../../supabase/auth";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { subscription } = useSubscription();

  // Group all state declarations
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Callbacks after state
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }, [signOut, navigate]);

  // Effects come last
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMaestroPlan = subscription?.plan_type?.toLowerCase() === "maestro";

  const handleItemClick = (item: NavItem) => {
    // Cerrar el drawer en móvil después de hacer clic
    setIsDrawerOpen(false);

    if (item.id === "logout") {
      handleSignOut();
    } else {
      onItemClick(item.id);
    }
  };

  return (
    <>
      {/* Botón de hamburguesa para móvil - con estilo en línea para top negativo */}
      <div
        className="md:hidden absolute left-4 z-50"
        style={{ top: "8px" }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="mr-2"
          aria-label={
            isDrawerOpen ? t("sidebar.closeMenu") : t("sidebar.openMenu")
          }
        >
          {isDrawerOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Overlay para móvil */}
      {isDrawerOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Sidebar para desktop y drawer para móvil */}
      <div
        className={`
          md:relative fixed top-14 left-0 z-50
          md:flex md:flex-col w-64 bg-white border-r border-gray-200 shrink-0
          md:min-h-[100vh] md:sticky md:top-16
          transform transition-transform duration-300 ease-in-out
          ${
            isDrawerOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
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

              {!isMaestroPlan && (
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onItemClick("Pricing");
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors bg-gradient-to-r from-yellow-400 to-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-600"
                >
                  <Crown className="h-4 w-4" />
                  <span className="ml-3">{t("subscription.upgradePlan")}</span>
                </button>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
