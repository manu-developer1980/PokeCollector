import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../../supabase/auth";

export default function MainHeader() {
  const { user } = useAuth();

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
        <nav className="flex items-center space-x-4">
          {user ? (
            <Link to="/dashboard">
              <Button className="bg-red-600 hover:bg-red-700">
                Mi Colección
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-red-600"
                >
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-red-600 hover:bg-red-700">
                  Comenzar
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
