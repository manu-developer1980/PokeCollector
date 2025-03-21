import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  id: string;
  badge?: string;
}

interface MobileMenuProps {
  items: NavItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
}

export function MobileMenu({ items, activeItem, onItemClick }: MobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
        >
          <Menu size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-64 p-0 pt-16"
      >
        <div className="flex flex-col h-full p-4">
          <ScrollArea className="flex-1">
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
            </nav>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}