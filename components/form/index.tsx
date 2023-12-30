"use client";

import { Niche } from "@/niche";
import LoadingDots from "@/components/icons/loading-dots";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import DomainStatus from "./domain-status";
import DomainConfiguration from "./domain-configuration";
import Uploader from "./uploader";
import va from "@vercel/analytics";
import { useUser } from "@/lib/user";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useId } from "react";

export default function Form({
  title,
  description,
  helpText,
  inputAttrs,
  handleSubmit,
  slug,
}: {
  title: string;
  description?: string;
  helpText: string;
  inputAttrs: {
    name: string;
    type: string;
    defaultValue: string;
    defaultChecked?: boolean;
    placeholder?: string;
    label?: string;
    maxLength?: number;
    pattern?: string;
    maxSize?: number;
    items?: any[];
  };
  handleSubmit: any;
  slug?: boolean;
}) {
  const { id } = useParams() as { id?: string };
  const router = useRouter();
  const { setUser } = useUser()
  const gid = useId()

  const renderInput = (attrs: any = {}) => {
    const { type } = attrs
    switch (type) {

      case 'text':
        return (<Input {...attrs} required />);

      case 'textarea':
        return (<Textarea {...attrs} rows={attrs.rows || 3} required />);

      case 'switch':
        return (<div className="flex items-center space-x-2">
          <Switch
            id={gid}
            name={attrs.name}
            defaultChecked={attrs.defaultChecked}
          />
          <Label htmlFor={gid}>{attrs.label}</Label>
        </div>);

      case 'file':
        return (<Uploader
          defaultValue={attrs.defaultValue}
          name={attrs.name}
          maxSize={attrs?.maxSize}
        />);

      case 'select':
        return (<Select {...attrs}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={attrs.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {attrs.items.map(([key, value]: any) => <SelectItem key={key} value={key}>{value}</SelectItem>)}
          </SelectContent>
        </Select>);

      default:
        return 'Invalid Input Type';
    }
  }

  return (
    <form
      action={async (data: FormData) => {
        if (
          inputAttrs.name === "customDomain" &&
          inputAttrs.defaultValue &&
          data.get("customDomain") !== inputAttrs.defaultValue &&
          !confirm("Are you sure you want to change your custom domain?")
        ) {
          return;
        }
        handleSubmit(data, id, inputAttrs.name).then(async (res: any) => {
          if (res.error) {
            toast.error(res.error);
          } else {
            va.track(`Updated ${inputAttrs.name}`, id ? { id } : {});
            if (id) {
              router.refresh();
            } else {
              // await update() //session user
              if (res.email) setUser(res)
              router.refresh();
            }
            toast.success(`Sauvegarde de "${inputAttrs.name}" réussie!`);
          }
        });
      }}
      className="rounded-lg border "
    >
      <div className="relative flex flex-col space-y-4 p-5 sm:p-10">
        <h2 className="font-cal text-xl">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>

        {!["subdomain", "customDomain"].includes(inputAttrs.name)
          ? renderInput(inputAttrs)
          : inputAttrs.name === "subdomain" ? (
            <div className="flex w-full max-w-md">
              <Input {...inputAttrs} required className="z-10 flex-1 rounded-r-none" />
              <div className="flex items-center rounded-r-md border border-l-0 bg-muted px-3 text-sm">
                {Niche.domain}
              </div>
            </div>
          ) : inputAttrs.name === "customDomain" ? (
            <div className="relative flex w-full max-w-md">
              <Input {...inputAttrs} className="z-10 flex-1" />
              {inputAttrs.defaultValue && (
                <div className="absolute right-3 z-10 flex h-full items-center">
                  <DomainStatus domain={inputAttrs.defaultValue} />
                </div>
              )}
            </div>
          ) : ("invalid input type")
        }
      </div>

      {inputAttrs.name === "customDomain" && inputAttrs.defaultValue && (
        <DomainConfiguration domain={inputAttrs.defaultValue} />
      )}

      <div className="flex flex-col items-center justify-center space-y-2 rounded-b-lg border-t p-3 sm:flex-row sm:justify-between sm:space-y-0 sm:px-10 bg-muted">
        <p className="text-sm text-muted-foreground">{helpText}</p>
        <FormButton />
      </div>
    </form>
  );
}

function FormButton() {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} className="h-8 w-32 sm:h-10">
      {pending ? <LoadingDots color="#808080" /> : <p>Sauvegarder</p>}
    </Button>
  );
}
