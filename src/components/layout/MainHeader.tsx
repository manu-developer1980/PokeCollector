import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../../supabase/auth";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

interface MainHeaderProps {
  showNavigation?: boolean;
}

export default function MainHeader({ showNavigation = true }: MainHeaderProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const NavigationContent = () => (
    <>
      {user ? (
        <Link to="/dashboard">
          <Button className="bg-red-600 hover:bg-red-700 w-full">
            Mi Colección
          </Button>
        </Link>
      ) : (
        <>
          <Link to="/login" className="w-full">
            <Button
              variant="ghost"
              className="text-gray-700 hover:text-red-600 w-full"
            >
              Iniciar Sesión
            </Button>
          </Link>
          <Link to="/pricing" className="w-full">
            <Button className="bg-red-600 hover:bg-red-700 w-full">
              Comenzar
            </Button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="font-bold text-xl flex items-center text-red-600"
          >
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
              alt="Pokeball"
              className="h-6 w-6 mr-2"
            />
            PokéCollector
          </Link>
        </div>
        
        {showNavigation && (
          <>
            {/* Versión Desktop */}
            <nav className="hidden md:flex items-center space-x-4">
              <NavigationContent />
            </nav>

            {/* Versión Mobile */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  <NavigationContent />
                </nav>
              </SheetContent>
            </Sheet>
          </>
        )}
      </div>
    </header>
  );
}
