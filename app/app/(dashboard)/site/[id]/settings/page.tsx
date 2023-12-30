import prisma from "@/lib/prisma";
import Form from "@/components/form";
import { updateSite } from "@/lib/actions";
import DeleteSiteForm from "@/components/form/delete-site-form";

export default async function SiteSettingsIndex({
  params,
}: {
  params: { id: string };
}) {
  const data = await prisma.site.findUnique({
    where: {
      id: decodeURIComponent(params.id),
    },
  });

  return (
    <div className="flex flex-col space-y-6">
      <Form
        title="Nom"
        description="Le nom de votre site. Cette info est utilisée pour le référencement Google."
        helpText="32 charactères maximum."
        inputAttrs={{
          name: "name",
          type: "text",
          defaultValue: data?.name!,
          placeholder: "Mon Super Site",
          maxLength: 32,
        }}
        handleSubmit={updateSite}
      />

      <Form
        title="Description"
        description="La description du site. Cette info est utilisée pour le référencement Google."
        helpText="Pour optimiser le SEO, utilisez des mot clés appropriés."
        inputAttrs={{
          name: "description",
          type: "textarea",
          defaultValue: data?.description!,
          placeholder: "Cabinet dentaire spécialisé dans les implants et le blanchiment des dents.",
        }}
        handleSubmit={updateSite}
      />

      <Form
        title="Blog"
        description="Cochez la case ci dessous pour activer le Blog sur votre site."
        //@ts-ignore
        inputAttrs={{
          name: "hasBlog",
          type: "switch",
          defaultChecked: data?.hasBlog,
          label: "Activer le Blog",
        }}
        handleSubmit={updateSite}
      />

      <DeleteSiteForm siteName={data?.name!} />
    </div>
  );
}
