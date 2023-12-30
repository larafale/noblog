import { ReactNode, Suspense } from "react";
import Profile from "@/components/profile";
import Nav from "@/components/nav";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma"
import CreateSiteModal from "@/components/modal/create-site";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getUser()
  if (!user) return

  const nbSites = await prisma.site.count({
    where: { userId: user.id }
  });

  if (!nbSites) return <div className="md:h-screen flex items-center justify-center">
    <CreateSiteModal />
  </div>

  return (
    <div>
      <Nav>
        <Suspense fallback={<div>Loading...</div>}>
          <Profile />
        </Suspense>
      </Nav>
      <div className="min-h-screen sm:pl-60">{children}</div>
    </div>
  );
}
