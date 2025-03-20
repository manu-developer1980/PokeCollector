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
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
