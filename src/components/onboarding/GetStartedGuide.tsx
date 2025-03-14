import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { Search, Database, Heart, ArrowRight } from "lucide-react";

interface GetStartedGuideProps {
  onClose?: () => void;
}

const GetStartedGuide = ({ onClose }: GetStartedGuideProps) => {
  const steps = [
    {
      title: "Buscar Cartas",
      description:
        "Explora miles de cartas Pokémon usando nuestras herramientas de búsqueda y filtrado.",
      icon: <Search className="h-6 w-6 text-blue-600" />,
      action: "/dashboard",
      actionText: "Buscar Cartas",
    },
    {
      title: "Construye tu Colección",
      description:
        "Añade cartas a tu colección con detalles como cantidad, condición y notas.",
      icon: <Database className="h-6 w-6 text-blue-600" />,
      action: "/collection",
      actionText: "Ir a Mi Colección",
    },
    {
      title: "Crear una Lista de Deseos",
      description:
        "Mantén un seguimiento de las cartas que deseas añadir a tu colección en el futuro.",
      icon: <Heart className="h-6 w-6 text-red-600" />,
      action: "/wishlist",
      actionText: "Iniciar Lista de Deseos",
    },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto border-2 border-red-100 shadow-lg bg-gradient-to-br from-white to-red-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
              alt="Pokeball"
              className="h-6 w-6"
            />
            Comienza con PokéCollector
          </CardTitle>
          <Badge className="bg-yellow-200 text-yellow-800 hover:bg-yellow-300 border-none">
            Guía de Nuevo Usuario
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-6">
          ¡Bienvenido a PokéCollector! Sigue estos sencillos pasos para comenzar
          a gestionar tu colección de cartas Pokémon.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="mb-4 bg-gray-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">
                  {index + 1}. {step.title}
                </h3>
                <p className="text-gray-600 mb-4">{step.description}</p>
                <Link to={step.action}>
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    {step.actionText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-6" />

        <div className="flex justify-center">
          <Button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 px-8"
          >
            Comenzar a Coleccionar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GetStartedGuide;
