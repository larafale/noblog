import prisma from "@/lib/prisma";
import Form from "@/components/form";
import { updateSite } from "@/lib/actions";

export default async function SiteSettingsAppearance({
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
        title="Image de couverture"
        description="Image de couverture du site. Formats acceptés: .png, .jpg, .jpeg"
        helpText="Taille max 10MB. Dimension recommandée 1200x630."
        inputAttrs={{
          name: "image",
          type: "file",
          maxSize: 10,
          defaultValue: data?.image!,
        }}
        handleSubmit={updateSite}
      />
      <Form
        title="Logo"
        description="Le logo de votre site. Formats acceptés: .png, .jpg, .jpeg"
        helpText="Taille max 2MB. Dimension recommandée 400x400."
        inputAttrs={{
          name: "logo",
          maxSize: 2,
          type: "file",
          defaultValue: data?.logo!,
        }}
        handleSubmit={updateSite}
      />
      <Form
        title="Font"
        description="The font for the heading text your site."
        helpText="Please select a font."
        inputAttrs={{
          name: "font",
          type: "select",
          defaultValue: data?.font!,
          placeholder: "Font",
          items: [
            ["font-cal", "Cal Sans"],
            ["font-lora", "Lora"],
            ["font-work", "Work Sans"],
          ]
        }}
        handleSubmit={updateSite}
      />
      {/* <Form
        title="404 Page Message"
        description="Message to be displayed on the 404 page."
        helpText="Please use 240 characters maximum."
        inputAttrs={{
          name: "message404",
          type: "text",
          defaultValue: data?.message404!,
          placeholder: "Blimey! You've found a page that doesn't exist.",
          maxLength: 240,
        }}
        handleSubmit={updateSite}
      /> */}
    </div>
  );
}
