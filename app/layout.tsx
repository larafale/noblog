import "@/styles/globals.css";
import { cal, inter } from "@/styles/fonts";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "./providers";
import { Metadata } from "next";
import { cn } from "@/lib/utils";
import { getUser } from "@/lib/auth";
import { Niche } from "@/niche";



const title = Niche.title
const description = Niche.description
const image = Niche.image

export const metadata: Metadata = {
  title,
  description,
  icons: ["https://vercel.pub/favicon.ico"],
  openGraph: {
    title,
    description,
    images: [image],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
    creator: `@${Niche.domain}`,
  },
  metadataBase: new URL(Niche.url),

};


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const user = await getUser("root")


  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(cal.variable, inter.variable)}>
        <Providers user={user}>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
