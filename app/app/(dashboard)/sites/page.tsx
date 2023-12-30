import { Suspense } from "react";
import Sites from "@/components/sites";
import PlaceholderCard from "@/components/placeholder-card";
import CreateSiteButton from "@/components/create-site-button";
import CreateSiteModal from "@/components/modal/create-site";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getFirstSiteFromUserId } from "@/lib/actions";
import { placeholderCard } from "@/components/placeholders";

export default async function AllSites({ params }: { params: { id: string } }) {
  const user = await getUser()
  if (!user) return

  if (!user.isMulti) {
    const siteId = await getFirstSiteFromUserId(user.id)
    return redirect(siteId ? `/site/${siteId}/settings` : '/')
  }

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-cal text-3xl font-bold dark:text-white">
            Tous les Sites
          </h1>
          <CreateSiteButton>
            <CreateSiteModal />
          </CreateSiteButton>
        </div>
        <Suspense fallback={placeholderCard} >
          <Sites />
        </Suspense>
      </div>
    </div>
  );
}
