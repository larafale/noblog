export type nicheConfig = {
  key: string;
  domain: string;
  url: string;
  name: string;
  title: string;
  description: string;
  image: string;
};

export const Niche: nicheConfig = {
  key: "noblog",
  domain: "noblog.app",
  url: "https://noblog.app",
  name: "NoBlog",
  title: "NoBlog - AI powered blogging",
  description: "The fastest way to blog",
  image: "https://vercel.pub/thumbnail.png",
};
