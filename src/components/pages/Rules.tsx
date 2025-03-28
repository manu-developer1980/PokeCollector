import { ScrollArea } from "@/components/ui/scroll-area";

export default function Rules() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <ScrollArea className="h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-16">
              <h1 className="text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-500">
                Guía Completa y Detallada del JCC Pokémon
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Esta guía proporciona una explicación exhaustiva de las reglas
                del Juego de Cartas Coleccionables Pokémon, diseñada para ser
                una referencia completa y fácil de entender para jugadores de
                todos los niveles.
              </p>
            </div>

            {/* Main Content */}
            <div className="space-y-12">
              {/* Sección 1: Introducción */}
              <section className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-3xl font-bold mb-6 text-red-600">
                  1. Introducción al JCC Pokémon
                </h2>
                {/* Contenido de la introducción... */}
              </section>

              {/* Sección 2: Preparación de la Partida */}
              <section className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-3xl font-bold mb-6 text-red-600">
                  2. Preparación de la Partida
                </h2>
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                  <ol className="list-none space-y-4">
                    {[
                      "Estrechar las manos: Como muestra de deportividad, los jugadores deben saludarse.",
                      "Lanzar una moneda: Los jugadores lanzan una moneda, y el ganador elige si quiere comenzar primero o ceder el primer turno a su oponente.",
                      "Barajar los mazos: Cada jugador baraja completamente su mazo de 60 cartas para que el orden sea aleatorio.",
                      "Robar la mano inicial: Cada jugador roba las siete primeras cartas de su mazo.",
                      "Comprobar si hay un Pokémon Básico: Cada jugador revisa su mano inicial.",
                      "Colocar el Pokémon Activo: Cada jugador elige un Pokémon Básico de su mano.",
                      "Colocar Pokémon en la Banca (opcional): Hasta cinco Pokémon Básicos adicionales.",
                      "Colocar las cartas de Premio: Seis cartas superiores del mazo.",
                    ].map((step, index) => (
                      <li
                        key={index}
                        className="flex items-start"
                      >
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>

              {/* Sección 3: El Turno del Jugador */}
              <section className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-3xl font-bold mb-6 text-red-600">
                  3. El Turno del Jugador
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold mb-4 text-yellow-800">
                      Acciones Principales
                    </h3>
                    <ul className="space-y-3">
                      {[
                        "Robar una carta al inicio del turno",
                        "Colocar Pokémon Básicos en la Banca",
                        "Evolucionar Pokémon",
                        "Unir una carta de Energía",
                        "Jugar cartas de Entrenador",
                        "Retirar el Pokémon Activo",
                        "Usar habilidades",
                        "Atacar",
                      ].map((action, index) => (
                        <li
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold mb-4 text-green-800">
                      Restricciones por Turno
                    </h3>
                    <ul className="space-y-3">
                      {[
                        "Solo una carta de Energía",
                        "Una evolución por Pokémon",
                        "Un ataque para finalizar el turno",
                        "Una Herramienta Pokémon",
                        "Una retirada del Pokémon Activo",
                      ].map((restriction, index) => (
                        <li
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          <span>{restriction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Sección 4: Combate y Daño */}
              <section className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-3xl font-bold mb-6 text-red-600">
                  4. Combate y Daño
                </h2>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-red-800">
                      Proceso de Ataque
                    </h3>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Verificar energía requerida</li>
                      <li>Aplicar efectos previos al ataque</li>
                      <li>Calcular daño base</li>
                      <li>Aplicar debilidades y resistencias</li>
                      <li>Colocar contadores de daño</li>
                      <li>Verificar efectos adicionales</li>
                      <li>Comprobar si hay K.O.</li>
                    </ol>
                  </div>
                </div>
              </section>

              {/* Sección 5: Condiciones Especiales */}
              <section className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-3xl font-bold mb-6 text-red-600">
                  5. Condiciones Especiales
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      condition: "Dormido",
                      color: "blue",
                      effect:
                        "El Pokémon no puede atacar ni retirarse. Lanzar una moneda entre turnos - cara: se recupera.",
                    },
                    {
                      condition: "Paralizado",
                      color: "yellow",
                      effect:
                        "No puede atacar ni retirarse. Se recupera al final del siguiente turno.",
                    },
                    {
                      condition: "Confuso",
                      color: "purple",
                      effect:
                        "Para atacar, lanzar moneda. Cruz: se daña a sí mismo.",
                    },
                    {
                      condition: "Envenenado",
                      color: "green",
                      effect: "Coloca un contador de daño entre turnos.",
                    },
                    {
                      condition: "Quemado",
                      color: "red",
                      effect:
                        "Lanzar moneda entre turnos. Cruz: dos contadores de daño.",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={`bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 p-4 rounded-lg`}
                    >
                      <h4
                        className={`font-semibold text-${item.color}-800 mb-2`}
                      >
                        {item.condition}
                      </h4>
                      <p className="text-sm">{item.effect}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Sección 6: Cómo Ganar */}
              <section className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-3xl font-bold mb-6 text-red-600">
                  6. Cómo Ganar la Partida
                </h2>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg">
                  <ul className="space-y-4">
                    {[
                      "Tomar todas las seis cartas de Premio.",
                      "Dejar al oponente sin ningún Pokémon en juego.",
                      "Que el oponente no pueda robar una carta al comenzar su turno.",
                    ].map((condition, index) => (
                      <li
                        key={index}
                        className="flex items-center space-x-3"
                      >
                        <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span>{condition}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Footer */}
              <footer className="mt-16 pt-8 border-t text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Esta guía proporciona una base sólida para comprender las
                  reglas del Juego de Cartas Coleccionables Pokémon. Para
                  obtener información más detallada y ejemplos específicos, se
                  recomienda consultar los manuales de reglas oficiales de
                  Pokémon y explorar recursos en línea.
                </p>
                <p className="text-sm font-semibold text-red-600">
                  ¡Disfruta de tus duelos Pokémon!
                </p>
              </footer>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
