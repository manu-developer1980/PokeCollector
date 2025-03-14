import MainHeader from "./MainHeader";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <MainHeader />
      <main>{children}</main>
    </div>
  );
}
