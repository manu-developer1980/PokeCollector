import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../../supabase/auth";
import { Search, Database, Heart, LogIn, LogOut, User } from "lucide-react";
import { MobileMenu } from "@/components/common/shared/MobileMenu";
import LanguageSwitcher from "../common/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { ApiStatusBadge } from "@/components/common/ApiStatusIndicator";

interface MainHeaderProps {
  showNavigation?: boolean;
}

export default function MainHeader({ showNavigation = true }: MainHeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
      label: t("navigation.collection"),
      id: "My Collection",
    },
    {
      icon: <Heart size={18} />,
      label: t("navigation.wishlist"),
      id: "Wishlist",
    },
    {
      icon: <Search size={18} />,
      label: t("navigation.search"),
      id: "Search Cards",
    },
    {
      icon: <User size={18} />,
      label: t("navigation.account"),
      id: "Account",
    },
  ];

  const mobileMenuItems = [
    ...navigationItems,
    {
      icon: <LogOut size={18} />,
      label: t("auth.logout"),
      id: "logout",
    },
  ];

  const handleNavigation = (section: string) => {
    navigate("/dashboard", { state: { activeSection: section } });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-screen-xl mx-auto  pl-16 px-0 md:px-6 lg:px-8 flex h-14 items-center">
        <div className="flex items-center justify-between w-full gap-4">
          <div className="flex items-center gap-2 md:gap-4">
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

          {!user && (
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="ml-auto"
              size="icon"
              aria-label={t("auth.login")}
            >
              <LogIn className="h-4 w-4" />
            </Button>
          )}

          {/* Botón de cerrar sesión - solo icono */}
          {user && (
            <div className="sm:flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                size="icon"
                aria-label={t("auth.logout")}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ApiStatusBadge className="hidden sm:flex" />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
