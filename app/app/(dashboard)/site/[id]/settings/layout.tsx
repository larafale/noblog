import { Niche } from "@/niche";
import { ReactNode } from "react";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import SiteSettingsNav from "./nav";

export default async function SiteAnalyticsLayout({
  params,
  children,
}: {
  params: { id: string };
  children: ReactNode;
}) {
  const user = await getUser()
  if (!user) return

  const data = await prisma.site.findUnique({
    where: {
      id: decodeURIComponent(params.id),
    },
  });

  if (!data || data.userId !== user.id) notFound();

  const url = `${data.subdomain}.${Niche.domain}`;

  return (
    <>
      <div className="flex flex-col items-start space-y-2">
        <h1 className="font-cal text-xl font-bold dark:text-white sm:text-3xl">
          { user.isMulti ? `Paramètres (${data.name})` : `Paramètres` }
        </h1>
        <a
          href={
            process.env.NEXT_PUBLIC_VERCEL_ENV
              ? `https://${url}`
              : `http://${data.subdomain}.localhost:3000`
          }
          target="_blank"
          rel="noreferrer"
          className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
        >
          {url} ↗
        </a>
      </div>
      <SiteSettingsNav />
      {children}
    </>
  );
}
