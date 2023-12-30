"use client";

import CreateSiteModal from "@/components/modal/create-site";
import { useModal } from "@/components/modal/provider";
import { useUser } from "@/lib/user";
import { timeout } from "@/lib/utils";
import { ReactNode, useEffect } from "react";

export default function CreateSiteInit() {
    const modal = useModal();
    const form = <CreateSiteModal />
    
    useEffect(() => {
        (async () => {
            await timeout()
            modal?.show(form)
        })()
    })

    return null
}
