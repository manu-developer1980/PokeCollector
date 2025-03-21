import MainHeader from "./MainHeader";
import Footer from "../pages/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <MainHeader />
      <main className="flex-1 bg-gradient-to-b from-yellow-50 to-red-50">
        {children}
      </main>
      <Footer />
    </div>
  );
}
