import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Crown } from "lucide-react";
import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "../../../../supabase/auth";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  id: string;
  badge?: string;
  onClick?: () => void;
}

interface MobileMenuProps {
  items: NavItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
}

export function MobileMenu({
  items,
  activeItem,
  onItemClick,
}: MobileMenuProps) {
  // Hooks deben estar en el nivel superior y en el mismo orden siempre
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { subscription } = useSubscription();

  const isMaestroPlan = (subscription as any)?.plan_type?.toLowerCase() === "maestro";

  const handleItemClick = (item: NavItem) => {
    if (item.onClick) {
      item.onClick();
    } else {
      onItemClick(item.id);
    }
    setOpen(false);
  };

  // Si no hay usuario, no renderizamos el menú
  if (!user) return null;

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
    >
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-64"
      >
        <SheetHeader>
          <SheetTitle>Menú</SheetTitle>
          <SheetDescription className="hidden">
            Navegación principal de PokéCollector
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
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

          {!isMaestroPlan && (
            <button
              onClick={() => {
                onItemClick("Pricing");
                setOpen(false);
              }}
              className="w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors bg-gradient-to-r from-yellow-400 to-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-600"
            >
              <Crown className="h-4 w-4" />
              <span className="ml-3">Mejorar Plan</span>
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
