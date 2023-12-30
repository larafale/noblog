import LoadingDots from "@/components/icons/loading-dots";

export default function Loading() {
  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex h-full w-full items-center justify-center">
        <LoadingDots />
      </div>
    </div>
  );
}
