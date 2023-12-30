import { Suspense } from "react";
import Sites from "@/components/sites";
import OverviewStats from "@/components/overview-stats";
import Posts from "@/components/posts";
import OverviewSitesCTA from "@/components/overview-sites-cta";
import { placeholderCard } from "@/components/placeholders";
import { getUser } from "@/lib/auth";



export default async function Overview() {
  const user = await getUser()
  if (!user) return

  return (<>
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <OverviewStats />
      </div>

      {user.isMulti && <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-cal text-3xl font-bold">
            Top Sites
          </h1>
          <Suspense fallback={null}>
            <OverviewSitesCTA />
          </Suspense>
        </div>
        <Suspense fallback={placeholderCard} >
          <Sites limit={4} />
        </Suspense>
      </div>}

      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold">
          Articles Récents
        </h1>
        <Suspense fallback={placeholderCard} >
          <Posts limit={8} />
        </Suspense>
      </div>
    </div>
  </>
  );
}
