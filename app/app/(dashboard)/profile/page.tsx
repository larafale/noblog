import Form from "@/components/form";
import { getUser } from "@/lib/auth";
import { editUser } from "@/lib/actions";

export default async function ProfilePage() {
  const user = await getUser()
  if (!user) return

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          Profil
        </h1>
        <Form
          title="Nom"
          description="Votre nom sur l'application"
          helpText="32 characters maximum."
          inputAttrs={{
            name: "name",
            type: "text",
            defaultValue: user.name!,
            placeholder: "Bruce Wayne",
            maxLength: 32,
          }}
          handleSubmit={editUser}
        />
        <Form
          title="Email"
          description="Votre email sur l'application"
          helpText="Ajouter un email valide."
          inputAttrs={{
            name: "email",
            type: "email",
            defaultValue: user.email!,
            placeholder: "batman@gotam.city",
          }}
          handleSubmit={editUser}
        />
      </div>
    </div>
  );
}
