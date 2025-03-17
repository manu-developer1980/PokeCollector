import MainHeader from "./MainHeader";
import Footer from "../pages/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <MainHeader />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
