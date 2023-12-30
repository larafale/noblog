import { headers } from "next/headers";
import { getPostsForSite } from "@/lib/fetchers";
import { Niche } from "@/niche";

export default async function Sitemap() {
  const headersList = headers();
  const domain =
    headersList
      .get("host")
      ?.replace(".localhost:3000", `.${Niche.domain}`) ||
    "vercel.pub";

  const posts = await getPostsForSite(domain);

  return [
    {
      url: `https://${domain}`,
      lastModified: new Date(),
    },
    ...posts.map(({ slug }) => ({
      url: `https://${domain}/${slug}`,
      lastModified: new Date(),
    })),
  ];
}
