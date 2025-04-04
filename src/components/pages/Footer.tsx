import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import footerEs from "../../i18n/locales/footer/es.json";
import footerEn from "../../i18n/locales/footer/en.json";
import { useCookieConsent } from "@/hooks/useCookieConsent";

export default function Footer() {
  const { i18n } = useTranslation();
  const { openPreferences } = useCookieConsent();

  // Seleccionar las traducciones según el idioma actual
  const footerTranslations = i18n.language === "es" ? footerEs : footerEn;

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
              {footerTranslations.description}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-4 text-gray-900">
              {footerTranslations.features.title}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="#"
                  className="text-gray-600 hover:text-red-600"
                >
                  {footerTranslations.features.cardSearch}
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-gray-600 hover:text-red-600"
                >
                  {footerTranslations.features.collectionManagement}
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-gray-600 hover:text-red-600"
                >
                  {footerTranslations.features.wishlist}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-4 text-gray-900">
              {footerTranslations.resources.title}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="#"
                  className="text-gray-600 hover:text-red-600"
                >
                  {footerTranslations.resources.guides}
                </Link>
              </li>
              <li>
                <Link
                  to="/rules"
                  className="text-gray-600 hover:text-red-600"
                >
                  {footerTranslations.resources.rules}
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-gray-600 hover:text-red-600"
                >
                  {footerTranslations.resources.blog}
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-gray-600 hover:text-red-600"
                >
                  {footerTranslations.resources.tutorials}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-4 text-gray-900">
              {footerTranslations.company.title}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="#"
                  className="text-gray-600 hover:text-red-600"
                >
                  {footerTranslations.company.about}
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-gray-600 hover:text-red-600"
                >
                  {footerTranslations.company.contact}
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-gray-600 hover:text-red-600"
                >
                  {footerTranslations.company.privacy}
                </Link>
              </li>
              <li>
                <Link
                  to="/cookie-policy"
                  className="text-gray-600 hover:text-red-600"
                >
                  {footerTranslations.company.cookiePolicy}
                </Link>
              </li>
              <li>
                <button
                  onClick={openPreferences}
                  className="text-gray-600 hover:text-red-600 text-left w-full"
                >
                  {footerTranslations.company.manageCookies}
                </button>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-gray-600 hover:text-red-600"
                >
                  {footerTranslations.company.terms}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p>
            © {new Date().getFullYear()} PokéCollector.{" "}
            {footerTranslations.copyright}
          </p>
          <p className="mt-2 text-sm">{footerTranslations.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
