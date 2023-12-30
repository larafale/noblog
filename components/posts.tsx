import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PostCard from "./post-card";
import Image from "next/image";
import CreatePostButton from "@/components/create-post-button";

export default async function Posts({
  siteId,
  limit,
}: {
  siteId?: string;
  limit?: number;
}) {
  const user = await getUser()
  if (!user) return

  const posts = await prisma.post.findMany({
    where: {
      userId: user.id,
      ...(siteId ? { siteId } : {}),
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      site: true,
    },
    ...(limit ? { take: limit } : {}),
  });

  return posts.length > 0 ? (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} data={post} />
      ))}
    </div>
  ) : (
    <div className="flex flex-col items-center space-x-4">
      <h1 className="font-cal text-4xl">No Posts Yet</h1>
      <Image
        alt="missing post"
        src="https://illustrations.popsy.co/gray/graphic-design.svg"
        width={400}
        height={400}
      />
      <p className="text-lg text-stone-500 flex flex-col items-center gap-4">
        Vous n'avez pas encore d'articles.
        <CreatePostButton />
      </p>
    </div>
  );
}
