import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Form from "@/components/form";
import { updatePostMetadata } from "@/lib/actions";
import DeletePostForm from "@/components/form/delete-post-form";

export default async function PostSettings({
  params,
}: {
  params: { id: string };
}) {
  const user = await getUser()
  if (!user) return

  const data = await prisma.post.findUnique({
    where: {
      id: decodeURIComponent(params.id),
    },
  });
  if (!data || data.userId !== user.id) notFound()

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-6">
      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          {"Paramètres de l'article"}
        </h1>
        <Form
          title="Slug"
          description="Le slug fais parti de l'url de l'article. Il est important pour le référencement, et se constitue uniquement de lettres minuscules sans accents, de chiffres et de tirets '-'."
          helpText="Utilisez un slug unique pour cet article."
          inputAttrs={{
            name: "slug",
            type: "text",
            defaultValue: data?.slug!,
            placeholder: "slug",
          }}
          handleSubmit={updatePostMetadata}
        />

        <Form
          title="Image"
          description="Image de couverture de l'article. Formats acceptés: .png, .jpg, .jpeg"
          helpText="Taille max 10MB. Dimension recommandée 1200x630."
          inputAttrs={{
            name: "image",
            type: "file",
            defaultValue: data?.image!,
            maxSize: 10
          }}
          handleSubmit={updatePostMetadata}
        />

        <DeletePostForm postName={data?.title!} />
      </div>
    </div>
  );
}
