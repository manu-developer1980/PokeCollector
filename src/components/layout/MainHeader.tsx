import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../../supabase/auth";
import { Search, Database, Heart, LogIn, LogOut, User } from "lucide-react";
import { MobileMenu } from "@/components/shared/MobileMenu";

interface MainHeaderProps {
  showNavigation?: boolean;
}

export default function MainHeader({ showNavigation = true }: MainHeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const navigationItems = [
    {
      icon: <Database size={18} />,
      label: "Mi Colección",
      id: "My Collection",
    },
    {
      icon: <Heart size={18} />,
      label: "Lista de Deseos",
      id: "Wishlist",
    },
    {
      icon: <Search size={18} />,
      label: "Buscar Cartas",
      id: "Search Cards",
    },
    {
      icon: <User size={18} />,
      label: "Mi Cuenta",
      id: "Account",
    },
  ];

  const mobileMenuItems = [
    ...navigationItems,
    {
      icon: <LogOut size={18} />,
      label: "Cerrar Sesión",
      id: "logout",
    },
  ];

  const handleNavigation = (section: string) => {
    navigate("/dashboard", { state: { activeSection: section } });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center justify-between w-full gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            {/* Solo mostrar el menú móvil si el usuario está autenticado */}
            {user && (
              <MobileMenu
                items={mobileMenuItems}
                activeItem=""
                onItemClick={(id) => {
                  if (id === "logout") {
                    handleSignOut();
                  } else {
                    handleNavigation(id);
                  }
                }}
              />
            )}

            {/* Logo */}
            <Link
              to={user ? "/dashboard" : "/"}
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

          {/* Botones de autenticación */}
          <div className="hidden sm:flex items-center gap-4">
            {!user && (
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar sesión
              </Button>
            )}
            {user && (
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
