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
                  My Collection
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-red-600"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-red-600 hover:bg-red-700">
                    Get Started
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
                  Gotta Collect 'Em All
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
                  Manage Your Pokémon Card Collection
                </h1>
              </div>
              <p className="text-lg md:text-xl text-gray-600">
                Track, organize, and showcase your Pokémon TCG collection with
                our powerful collection management tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/pricing">
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                  >
                    Start Your Collection
                  </Button>
                </Link>
                <Link to="/search">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-600 w-full sm:w-auto"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Browse Cards
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
              Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">
              Everything You Need for Your Collection
            </h2>
            <p className="text-gray-600 max-w-[700px] mx-auto">
              PokéCollector provides all the tools you need to manage your
              Pokémon card collection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Card Search
                </h3>
                <p className="text-gray-600">
                  Search and filter through thousands of Pokémon cards by set,
                  type, rarity, and more.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <Database className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Collection Management
                </h3>
                <p className="text-gray-600">
                  Add cards to your collection, track quantities, and organize
                  them however you want.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Wishlist
                </h3>
                <p className="text-gray-600">
                  Keep track of cards you want to acquire with a dedicated
                  wishlist feature.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 bg-yellow-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <FolderPlus className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Custom Collections
                </h3>
                <p className="text-gray-600">
                  Create and manage multiple custom collections for different
                  sets or themes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 bg-red-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <ListFilter className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Advanced Filtering
                </h3>
                <p className="text-gray-600">
                  Filter your collection by set, type, rarity, and more to find
                  exactly what you're looking for.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4 bg-indigo-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Real-time Updates
                </h3>
                <p className="text-gray-600">
                  Your collection stays in sync across all your devices with
                  real-time updates.
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
                Ready to Start Your Collection?
              </h2>
              <p className="text-lg md:text-xl mb-8 text-gray-600">
                Join thousands of Pokémon card collectors who are already using
                PokéCollector to manage their collections.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/pricing">
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                  >
                    See Pricing Plans
                  </Button>
                </Link>
                <Link to="/search">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-600 w-full sm:w-auto"
                  >
                    Browse Cards
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
                The ultimate Pokémon TCG collection management tool for
                collectors of all levels.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4 text-gray-900">
                Features
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="#" className="text-gray-600 hover:text-red-600">
                    Card Search
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-600 hover:text-red-600">
                    Collection Management
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-600 hover:text-red-600">
                    Wishlist
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-600 hover:text-red-600">
                    Custom Collections
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4 text-gray-900">
                Resources
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="#" className="text-gray-600 hover:text-red-600">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-600 hover:text-red-600">
                    API Documentation
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-600 hover:text-red-600">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-600 hover:text-red-600">
                    Community
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4 text-gray-900">
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="#" className="text-gray-600 hover:text-red-600">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-600 hover:text-red-600">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-600 hover:text-red-600">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-600 hover:text-red-600">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>
              © {new Date().getFullYear()} PokéCollector. All rights reserved.
            </p>
            <p className="mt-2 text-sm">
              Pokémon and Pokémon character names are trademarks of Nintendo.
              This site is not affiliated with Nintendo or The Pokémon Company.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
