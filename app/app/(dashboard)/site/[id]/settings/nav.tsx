"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, useSelectedLayoutSegment } from "next/navigation";


export default function SiteSettingsNav() {
  const { id } = useParams() as { id?: string };
  const segment = useSelectedLayoutSegment();

  const navItems = [
    {
      name: "Général",
      href: `/site/${id}/settings`,
      segment: null,
    },
    {
      name: "Domaine",
      href: `/site/${id}/settings/domains`,
      segment: "domains",
    },
    {
      name: "Apparence",
      href: `/site/${id}/settings/appearance`,
      segment: "appearance",
    },
  ];

  return (
    <div className="flex space-x-4 border-b pb-4 pt-2">
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          // Change style depending on whether the link is active
          className={cn(
            "rounded-md py-2 px-3 text-sm font-medium transition-colors",
            segment === item.segment
              ? "bg-muted"
              : "hover:bg-muted",
          )}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}
