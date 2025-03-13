import PokemonDashboard from "../pages/PokemonDashboard";
import { AuthProvider } from "../../../supabase/auth";

export default function PokemonDashboardStoryboard() {
  return (
    <AuthProvider>
      <PokemonDashboard />
    </AuthProvider>
  );
}
