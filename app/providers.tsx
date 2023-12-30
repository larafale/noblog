"use client";

import { UserProvider } from "@/lib/user";
import { Toaster } from "sonner";
import { ModalProvider } from "@/components/modal/provider";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { ThemeProvider } from "next-themes";


export function Providers({ children, user }: { children: React.ReactNode, user: any }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <UserProvider user={user}>
        <Toaster className="dark:hidden" />
        <Toaster theme="dark" className="hidden dark:block" />
        <ModalProvider>{children}</ModalProvider>
        <TailwindIndicator />
      </UserProvider>
    </ThemeProvider>
  );
}
