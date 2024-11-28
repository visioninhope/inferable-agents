import { Header } from "@/components/header";
import { OrgList } from "@/components/OrgList";

export default async function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <main className="flex min-h-screen flex-col justify-stretch">
        <Header />
        <OrgList />
        <section>{children}</section>
      </main>
    </>
  );
}
