import { Niche } from "@/niche";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Posts from "@/components/posts";
import CreatePostButton from "@/components/create-post-button";

export default async function SitePosts({
  params,
}: {
  params: { id: string };
}) {
  return redirect(`/site/${params.id}/settings`)
}
