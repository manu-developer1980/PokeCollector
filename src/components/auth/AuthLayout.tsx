import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-yellow-50">
      <div className="max-w-md w-full px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
              alt="Pokeball"
              className="h-10 w-10"
            />
          </div>
          <h1 className="text-3xl font-bold text-red-600">PokéCollector</h1>
          <p className="text-slate-600 mt-2">
            Manage your Pokémon card collection
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
