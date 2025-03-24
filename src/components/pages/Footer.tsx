import { Link } from "react-router-dom";

export default function Footer() {
  return (
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
            <h3 className="font-medium text-lg mb-4 text-gray-900">Recursos</h3>
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
                  to="/rules"
                  className="text-gray-600 hover:text-red-600"
                >
                  Reglas
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
            <h3 className="font-medium text-lg mb-4 text-gray-900">Compañía</h3>
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
            registradas de Nintendo. Este sitio no está afiliado con Nintendo ni
            con The Pokémon Company.
          </p>
        </div>
      </div>
    </footer>
  );
}
