"use client";

import LoadingDots from "@/components/icons/loading-dots";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { deleteSite } from "@/lib/actions";
import va from "@vercel/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DeleteSiteForm({ siteName }: { siteName: string }) {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  return (
    <form
      action={async (data: FormData) =>
        window.confirm(`Etes vous sur de vouloir supprimer le site "${siteName}" ?`) &&
        deleteSite(data, id, "delete")
          .then(async (res) => {
            if (res.error) {
              toast.error(res.error);
            } else {
              va.track("Deleted Site");
              router.refresh();
              router.push("/");
              toast.success(`Suppression du site réussie!`);
            }
          })
          .catch((err: Error) => toast.error(err.message))
      }
      className="rounded-lg border border-destructive"
    >
      <div className="relative flex flex-col space-y-4 p-5 sm:p-10">
        <h2 className="font-cal text-xl">Suppression du site</h2>
        <p className="text-sm text-muted-foreground">
          Supprimez votre site et tout le contenu associé. Saisissez le nom de votre site <b>{siteName}</b> pour confirmation.
        </p>

        <Input
          name="confirm"
          type="text"
          required
          pattern={siteName}
          placeholder={siteName}
        />
      </div>

      <div className="flex flex-col items-center justify-center space-y-2 rounded-b-lg border-t p-3 sm:flex-row sm:justify-between sm:space-y-0 sm:px-10 bg-muted">
        <p className="text-center text-sm text-muted-foreground">
          Cette action est irreversible.
        </p>
        <div className="w-32">
          <FormButton />
        </div>
      </div>
    </form>
  );
}

function FormButton() {
  const { pending } = useFormStatus();
  return (
    <Button variant="destructive" disabled={pending} className="h-8 w-32 sm:h-10">
       {pending ? <LoadingDots color="#808080" /> : <p>Supprimer</p>}
    </Button>
  );
}
