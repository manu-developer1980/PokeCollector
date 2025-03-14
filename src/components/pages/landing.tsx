import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Database,
  ListFilter,
  Heart,
  FolderPlus,
  Zap,
} from "lucide-react";
import { useAuth } from "../../../supabase/auth";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-red-50">
      {/* Header */}
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

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-8">
              <div>
                <Badge className="mb-4 bg-yellow-200 text-yellow-800 hover:bg-yellow-300 border-none">
                  ¡Hazte con todos!
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
                  Gestiona tu Colección de Cartas Pokémon
                </h1>
              </div>
              <p className="text-lg md:text-xl text-gray-600">
                Rastrea, organiza y muestra tu colección de Pokémon TCG con
                nuestras potentes herramientas de gestión.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/pricing">
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                  >
                    Comenzar Ahora
                  </Button>
                </Link>
                <Link to="/search">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-600 w-full sm:w-auto"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Explorar Cartas
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="grid grid-cols-2 gap-4 transform rotate-3">
                <img
                  src="https://images.pokemontcg.io/sv3/1_hires.png"
                  alt="Charizard Card"
                  className="rounded-lg shadow-xl transform -rotate-6 hover:scale-105 transition-transform duration-300"
                />
                <img
                  src="https://images.pokemontcg.io/sv2/1_hires.png"
                  alt="Pikachu Card"
                  className="rounded-lg shadow-xl transform rotate-6 hover:scale-105 transition-transform duration-300"
                />
                <img
                  src="https://images.pokemontcg.io/sv3pt5/1_hires.png"
                  alt="Mewtwo Card"
                  className="rounded-lg shadow-xl transform rotate-3 hover:scale-105 transition-transform duration-300"
                />
                <img
                  src="https://images.pokemontcg.io/sv3/2_hires.png"
                  alt="Blastoise Card"
                  className="rounded-lg shadow-xl transform -rotate-3 hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-yellow-200 text-yellow-800 hover:bg-yellow-300 border-none">
              Características
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">
              Todo lo que Necesitas para tu Colección
            </h2>
            <p className="text-gray-600 max-w-[700px] mx-auto">
              PokéCollector te proporciona todas las herramientas necesarias
              para gestionar tu colección de cartas Pokémon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Búsqueda de Cartas
                </h3>
                <p className="text-gray-600">
                  Busca y filtra entre miles de cartas Pokémon por set, tipo,
                  rareza y más.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <Database className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Gestión de Colección
                </h3>
                <p className="text-gray-600">
                  Añade cartas a tu colección, controla cantidades y organízalas
                  como prefieras.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Lista de Deseos
                </h3>
                <p className="text-gray-600">
                  Mantén un registro de las cartas que deseas adquirir con
                  nuestra función de lista de deseos.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 bg-yellow-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <FolderPlus className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Colecciones Personalizadas
                </h3>
                <p className="text-gray-600">
                  Crea y gestiona múltiples colecciones personalizadas para
                  diferentes sets o temas.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 bg-red-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <ListFilter className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Filtrado Avanzado
                </h3>
                <p className="text-gray-600">
                  Filtra tu colección por set, tipo, rareza y más para encontrar
                  exactamente lo que buscas.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 bg-indigo-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Actualizaciones en Tiempo Real
                </h3>
                <p className="text-gray-600">
                  Tu colección se sincroniza en todos tus dispositivos con
                  actualizaciones en tiempo real.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-red-50 to-yellow-50">
        <div className="container px-4 mx-auto">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-200 max-w-4xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                ¿Listo para Iniciar tu Colección?
              </h2>
              <p className="text-lg md:text-xl mb-8 text-gray-600">
                Únete a miles de coleccionistas de cartas Pokémon que ya están
                utilizando PokéCollector para gestionar sus colecciones.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/pricing">
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                  >
                    Ver Planes de Precio
                  </Button>
                </Link>
                <Link to="/search">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-600 w-full sm:w-auto"
                  >
                    Explorar Cartas
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link
                to="/"
                className="font-bold text-xl flex items-center mb-4 text-red-600"
              >
                <img
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
                  alt="Pokeball"
                  className="h-6 w-6 mr-2"
                />
                PokéCollector
              </Link>
              <p className="text-gray-600 mb-4">
                La herramienta definitiva para gestionar tu colección de cartas
                Pokémon TCG, para coleccionistas de todos los niveles.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4 text-gray-900">
                Características
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="#"
                    className="text-gray-600 hover:text-red-600"
                  >
                    Búsqueda de Cartas
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-gray-600 hover:text-red-600"
                  >
                    Gestión de Colección
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-gray-600 hover:text-red-600"
                  >
                    Lista de Deseos
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4 text-gray-900">
                Recursos
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="#"
                    className="text-gray-600 hover:text-red-600"
                  >
                    Guías
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-gray-600 hover:text-red-600"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-gray-600 hover:text-red-600"
                  >
                    Tutoriales
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4 text-gray-900">
                Compañía
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="#"
                    className="text-gray-600 hover:text-red-600"
                  >
                    Acerca de
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-gray-600 hover:text-red-600"
                  >
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-gray-600 hover:text-red-600"
                  >
                    Política de Privacidad
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-gray-600 hover:text-red-600"
                  >
                    Términos de Servicio
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>
              © {new Date().getFullYear()} PokéCollector. Todos los derechos
              reservados.
            </p>
            <p className="mt-2 text-sm">
              Pokémon y los nombres de los personajes Pokémon son marcas
              registradas de Nintendo. Este sitio no está afiliado con Nintendo
              ni con The Pokémon Company.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
