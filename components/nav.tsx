"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Edit3,
  Globe,
  Layout,
  LayoutDashboard,
  Megaphone,
  Menu,
  Newspaper,
  Settings,
  FileCode,
  Github,
} from "lucide-react";
import {
  useParams,
  usePathname,
  useSelectedLayoutSegments,
} from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { getFirstSiteFromUserId, getSiteFromId, getSiteFromPostId } from "@/lib/actions";
import Image from "next/image";
import { useUser } from "@/lib/user";
import { useTheme } from "next-themes";

const externalLinks = [
  // {
  //   name: "Read announcement",
  //   href: "https://vercel.com/blog/platforms-starter-kit",
  //   icon: <Megaphone width={18} />,
  // },
  // {
  //   name: "Star on GitHub",
  //   href: "https://github.com/vercel/platforms",
  //   icon: <Github width={18} />,
  // },
  // {
  //   name: "Read the guide",
  //   href: "https://vercel.com/guides/nextjs-multi-tenant-application",
  //   icon: <FileCode width={18} />,
  // },
  // {
  //   name: "View demo site",
  //   href: "https://demo.vercel.pub",
  //   icon: <Layout width={18} />,
  // },
  // {
  //   name: "Deploy your own",
  //   href: "https://vercel.com/templates/next.js/platforms-starter-kit",
  //   icon: (
  //     <svg
  //       width={18}
  //       viewBox="0 0 76 76"
  //       fill="none"
  //       xmlns="http://www.w3.org/2000/svg"
  //       className="py-1 text-black dark:text-white"
  //     >
  //       <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor" />
  //     </svg>
  //   ),
  // },
];

export default function Nav({ children }: { children: ReactNode }) {
  const segments = useSelectedLayoutSegments();
  const { id } = useParams() as { id?: string };
  const { user } = useUser()

  const [site, setSite] = useState<{ id: string, hasBlog?: boolean } | null>();
  // const [siteId, setSiteId] = useState<string | null>();
  const [hasBlog, setHasBlog] = useState<boolean>(false);

  useEffect(() => {
    if (segments[0] === "post" && id) getSiteFromPostId(id).then(setSite);
    if (segments[0] === "site" && id) getSiteFromId(id).then(setSite);
    if (!segments[0] && !user.isMulti) getFirstSiteFromUserId(user.id).then(setSite);
  }, [id, segments[0]]);

  const tabs = useMemo(() => {

    const nav = []


    if (segments[0] === "site" && id) {
      if (user.isMulti) nav.push({
        name: "Retour aux Sites",
        href: "/sites",
        icon: <ArrowLeft width={18} />,
      })
      else nav.push({
        name: "Acceuil",
        href: "/",
        icon: <LayoutDashboard width={18} />,
      })
      nav.push({
        name: "Paramètres",
        href: `/site/${id}/settings`,
        isActive: segments.includes("settings"),
        icon: <Settings width={18} />,
      })
      if (site?.hasBlog) nav.push({
        name: "Blog",
        href: `/site/${id}/posts`,
        isActive: segments[2] === "posts",
        icon: <Newspaper width={18} />,
      })
      // if (user.isMulti) nav.push({
      //   name: "Analytics",
      //   href: `/site/${id}/analytics`,
      //   isActive: segments.includes("analytics"),
      //   icon: <BarChart3 width={18} />,
      // })
      return nav

    } else if (segments[0] === "post" && id) {
      nav.push({
        name: "Retour au Blog",
        href: site?.id ? `/site/${site.id}/posts` : "/sites",
        icon: <ArrowLeft width={18} />,
      })
      nav.push({
        name: "Article",
        href: `/post/${id}`,
        isActive: segments.length === 2,
        icon: <Edit3 width={18} />,
      })
      nav.push({
        name: "Paramètres",
        href: `/post/${id}/settings`,
        isActive: segments.includes("settings"),
        icon: <Settings width={18} />,
      })
      return nav
    }

    nav.push({
      name: "Acceuil",
      href: "/",
      isActive: segments.length === 0,
      icon: <LayoutDashboard width={18} />,
    })
    if (user.isMulti) nav.push({
      name: "Sites",
      href: "/sites",
      isActive: segments[0] === "sites",
      icon: <Globe width={18} />,
    })
    else if (site?.id) {
      nav.push({
        name: "Paramètres",
        href: `/site/${site.id}/settings`,
        isActive: segments[0] === "settings",
        icon: <Settings width={18} />,
      })
      if (site?.hasBlog) nav.push({
        name: "Blog",
        href: `/site/${site.id}/posts`,
        isActive: segments.length === 2,
        icon: <Newspaper width={18} />,
      })

    }

    return nav

  }, [segments, id, site]);

  const [showSidebar, setShowSidebar] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    // hide sidebar on path change
    setShowSidebar(false);
  }, [pathname]);

  const { setTheme, theme } = useTheme()


  return (
    <>
      <button
        className={`fixed z-20 ${
          // left align for Editor, right align for other pages
          segments[0] === "post" && segments.length === 2 && !showSidebar
            ? "left-5 top-5"
            : "right-5 top-5"
          } sm:hidden p-2 rounded dark:text-white dark:hover:bg-stone-700`}
        onClick={() => setShowSidebar(!showSidebar)}
      >
        <Menu width={20} />
      </button>
      <div
        className={`transform ${showSidebar ? "w-full translate-x-0" : "-translate-x-full"
          } fixed z-10 flex h-full flex-col justify-between border-r p-4 transition-all sm:w-60 sm:translate-x-0`}
      >
        <div className="grid gap-2">
          <div className="flex items-center space-x-2 rounded-lg py-1.5">

            <Link
              href="/"
              className="rounded-lg p-2 hover:bg-muted"
            >
              <Image
                src="/logo.png"
                width={24}
                height={24}
                alt="Logo"
                className="dark:scale-110 dark:rounded-full dark:border dark:border-stone-400"
              />
            </Link>

            <ArrowLeft onClick={() => setTheme(theme == "light" ? "dark" : "light")} width={18} />

          </div>
          <div className="grid gap-1">
            {tabs.map(({ name, href, isActive, icon }) => (
              <Link
                key={name}
                href={href}
                className={`flex items-center space-x-3 ${isActive ? "bg-muted" : ""
                  } rounded-lg px-2 py-1.5 transition-all duration-150 ease-in-out hover:bg-muted active:bg-muted`}
              >
                {icon}
                <span className="text-sm font-medium">{name}</span>
              </Link>
            ))}
          </div>
        </div>
        <div>
          {/* <div className="grid gap-1">
            {externalLinks.map(({ name, href, icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg px-2 py-1.5 transition-all duration-150 ease-in-out hover:bg-stone-200 active:bg-stone-300 dark:text-white dark:hover:bg-stone-700 dark:active:bg-stone-800"
              >
                <div className="flex items-center space-x-3">
                  {icon}
                  <span className="text-sm font-medium">{name}</span>
                </div>
                <p>↗</p>
              </a>
            ))}
          </div> */}
          <div className="my-2 border-t" />
          {children}
        </div>
      </div>
    </>
  );
}
