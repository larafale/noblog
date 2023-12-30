import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Editor from "@/components/editor";

export default async function PostPage({ params }: { params: { id: string } }) {
  const user = await getUser()
  if (!user) return

  const data = await prisma.post.findUnique({
    where: {
      id: decodeURIComponent(params.id),
    },
    include: {
      site: {
        select: {
          subdomain: true,
        },
      },
    },
  });
  if (!data || data.userId !== user.id) notFound();


  return <Editor post={data} />;
}
