import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { useToast } from "@/components/ui/use-toast";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();

  const changeLanguage = async (lng: string) => {
    // Change the language in i18n
    i18n.changeLanguage(lng);

    // Save preference to localStorage
    localStorage.setItem("preferredLanguage", lng);

    // If user is logged in, update their metadata
    if (user) {
      try {
        const { error } = await supabase.auth.updateUser({
          data: { preferred_lang: lng },
        });

        if (error) {
          console.error("Error updating language preference:", error);
        }
      } catch (err) {
        console.error("Error updating user language preference:", err);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
        >
          <Globe className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage("es")}>
          Español
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage("en")}>
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
