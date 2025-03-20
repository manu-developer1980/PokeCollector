import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../../supabase/auth";
import {
  Menu,
  User,
  LogOut,
  CreditCard,
  Search,
  Database,
  Heart,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { PlanUpgradeDialog } from "@/components/subscription/PlanUpgradeDialog";

interface MainHeaderProps {
  showNavigation?: boolean;
}

export default function MainHeader({ showNavigation = true }: MainHeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription } = useSubscription();
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);

  const handleNavigation = (section: string) => {
    if (section === "Pricing") {
      navigate("/pricing"); // Aquí sí navegamos a la página de pricing independiente
    } else {
      navigate("/dashboard", { state: { activeSection: section } });
    }
  };

  // Separar los botones de navegación del Sheet
  const NavigationButtons = ({ isMobile = false }) => {
    if (!user) return null;

    return (
      <>
        {isMobile ? (
          <>
            <SheetClose asChild>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigation("Search Cards")}
              >
                <Search className="mr-2 h-4 w-4" />
                Buscar Cartas
              </Button>
            </SheetClose>

            <SheetClose asChild>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigation("My Collection")}
              >
                <Database className="mr-2 h-4 w-4" />
                Mi Colección
              </Button>
            </SheetClose>

            <SheetClose asChild>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigation("Wishlist")}
              >
                <Heart className="mr-2 h-4 w-4" />
                Lista de Deseos
              </Button>
            </SheetClose>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleNavigation("Search Cards")}
            >
              <Search className="mr-2 h-4 w-4" />
              Buscar Cartas
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleNavigation("My Collection")}
            >
              <Database className="mr-2 h-4 w-4" />
              Mi Colección
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleNavigation("Wishlist")}
            >
              <Heart className="mr-2 h-4 w-4" />
              Lista de Deseos
            </Button>
          </>
        )}
      </>
    );
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/", { replace: true });
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    } catch (error) {
      console.error("Error during sign out:", error);
      toast({
        title: "Error",
        description:
          "No se pudo cerrar la sesión. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex items-center gap-2 md:gap-4">
              {/* Menú móvil - Solo mostrar si el usuario está autenticado */}
              {user && (
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
                    className="w-64 p-4"
                  >
                    <nav className="space-y-2">
                      <NavigationButtons isMobile={true} />
                    </nav>
                  </SheetContent>
                </Sheet>
              )}

              {/* Logo */}
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

              {/* Navegación desktop */}
              {showNavigation && (
                <nav className="hidden md:flex items-center space-x-4">
                  <NavigationButtons isMobile={false} />
                </nav>
              )}
            </div>

            {/* Avatar y menú de usuario */}
            <div className="flex items-center">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user?.user_metadata?.avatar_url}
                          alt={user?.email || ""}
                        />
                        <AvatarFallback>
                          {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56"
                  >
                    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        navigate("/dashboard", {
                          state: { activeSection: "Account" },
                        })
                      }
                    >
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsPlanDialogOpen(true)}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Cambiar Plan
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => navigate("/login")}
                >
                  Entrar
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      <PlanUpgradeDialog
        isOpen={isPlanDialogOpen}
        onClose={() => setIsPlanDialogOpen(false)}
        currentPlan={subscription?.plan_type || "APRENDIZ"}
      />
    </>
  );
}
