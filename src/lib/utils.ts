import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getRarityBadgeStyle = (rarity: string) => {
  switch (rarity) {
    case "Rare Rainbow":
      return "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 text-white border-none shadow-md";
    case "Rare Secret":
      return "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none shadow-md";
    case "Rare Ultra":
      return "bg-gradient-to-r from-yellow-400 to-amber-600 text-white border-none shadow-md";
    case "Rare Holo":
      return "bg-gradient-to-r from-blue-400 to-cyan-300 text-white border-none shadow-md";
    case "Rare Shining":
      return "bg-gradient-to-r from-slate-300 to-slate-100 text-slate-800 border-none shadow-md";
    case "Amazing Rare":
      return "bg-gradient-to-r from-indigo-400 to-purple-400 text-white border-none shadow-md";
    default:
      return "";
  }
};
