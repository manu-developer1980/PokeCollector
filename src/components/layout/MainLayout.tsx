import MainHeader from "./MainHeader";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainHeader />
      <div className="pt-16">{children}</div>
    </>
  );
}