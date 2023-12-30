import prisma from "@/lib/prisma";
import Form from "@/components/form";
import { updateSite } from "@/lib/actions";
import { getUser } from "@/lib/auth";

export default async function SiteSettingsDomains({
  params,
}: {
  params: { id: string };
}) {
  const user = await getUser()
  if (!user) return

  const data = await prisma.site.findUnique({
    where: {
      id: decodeURIComponent(params.id),
    },
  });

  return (
    <div className="flex flex-col space-y-6">
      <Form
        title="Lien unique"
        description="Lien unique du site."
        helpText="32 charactères maximum."
        inputAttrs={{
          name: "subdomain",
          type: "text",
          defaultValue: data?.subdomain!,
          placeholder: "subdomain",
          maxLength: 32,
        }}
        handleSubmit={updateSite}
      />
      { user.email == "louis.grellet@gmail.com" && <Form
        title="Domaine personnalisé"
        description="Nom de domaine personnalisé pour votre site."
        helpText='Saisissez un domain valide. Ne pas renseigner le "https://"'
        inputAttrs={{
          name: "customDomain",
          type: "text",
          defaultValue: data?.customDomain!,
          placeholder: "votredomaine.com",
          maxLength: 64,
          pattern: "^[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}$",
        }}
        handleSubmit={updateSite}
      />}
    </div>
  );
}
