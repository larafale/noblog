import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import SiteCard from "./site-card";
import Image from "next/image";

export default async function Sites({ limit }: { limit?: number }) {
  const user = await getUser()
  if (!user) return

  const sites = await prisma.site.findMany({
    where: {
      user: { id: user.id },
    },
    orderBy: {
      createdAt: "asc",
    },
    ...(limit ? { take: limit } : {}),
  });

  return sites.length > 0 ? (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {sites.map((site) => (
        <SiteCard key={site.id} data={site} />
      ))}
    </div>
  ) : (
    <div className="mt-20 flex flex-col items-center space-x-4">
      <h1 className="font-cal text-4xl">No Sites Yet</h1>
      <Image
        alt="missing site"
        src="https://illustrations.popsy.co/gray/web-design.svg"
        width={400}
        height={400}
      />
      <p className="text-lg text-stone-500">
        You do not have any sites yet. Create one to get started.
      </p>
    </div>
  );
}
