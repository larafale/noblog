// a bunch of loading divs

import { placeholderCard } from "@/components/placeholders";

export default function Loading() {
  return (
    <>
      <div className="h-10 w-48 animate-pulse rounded-md bg-muted" />
      {placeholderCard}
    </>
  );
}
