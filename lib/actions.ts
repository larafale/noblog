"use server";

import { Niche } from "@/niche";
import prisma from "@/lib/prisma";
import { Post, Site } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { withPostAuth, withSiteAuth } from "./auth";
import { getUser } from "@/lib/auth";
import {
  addDomainToVercel,
  // getApexDomain,
  removeDomainFromVercelProject,
  // removeDomainFromVercelTeam,
  validDomainRegex,
} from "@/lib/domains";
import { customAlphabet } from "nanoid";
import { getBlurDataURL, slugify } from "@/lib/utils";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  // secure: true,
});

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7,
); // 7-character random string

export const upload = async (file: File, options?: any): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(options, function (err, result) {
        if (err) return reject(err);
        resolve(result?.secure_url as string);
      })
      .end(buffer);
  });
};

export const createSite = async (formData: FormData) => {
  const user = await getUser();
  if (!user?.id) return { error: "Not authenticated" };

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const subdomain = formData.get("subdomain") as string;

  try {
    const response = await prisma.site.create({
      data: {
        name,
        description,
        subdomain,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
    await revalidateTag(`${subdomain}.${Niche.domain}-metadata`);
    return response;
  } catch (error: any) {
    if (error.code === "P2002")
      return { error: `This subdomain is already taken` };
    else return { error: error.message };
  }
};

export const updateSite = withSiteAuth(
  async (formData: FormData, site: Site, key: string) => {
    const value = formData.get(key) as string;

    const updateSite = async (data: any) =>
      prisma.site.update({
        where: { id: site.id },
        data,
      });

    try {
      let response;

      if (key === "customDomain") {
        if (value.includes(Niche.domain)) {
          return {
            error: `Cannot use ${Niche.domain} as your custom domain`,
          };

          // if the custom domain is valid, we need to add it to Vercel
        } else if (validDomainRegex.test(value)) {
          const [r0, r1] = await Promise.all([
            addDomainToVercel(value),
            // Optional: add www subdomain as well and redirect to apex domain
            addDomainToVercel(`www.${value}`),
          ]);

          if (!r0 || r0.error)
            return {
              error: `unable to add custom domain ${value} : ${r0?.message}`,
            };

          // response = await updateSite({ customDomain: value });
          console.log("v", r0);

          // empty value means the user wants to remove the custom domain
        } else if (value === "") {
          response = await updateSite({ customDomain: null });
        }

        // if the site had a different customDomain before, we need to remove it from Vercel
        if (site.customDomain && site.customDomain !== value) {
          response = await removeDomainFromVercelProject(site.customDomain);

          /* Optional: remove domain from Vercel team 

          // first, we need to check if the apex domain is being used by other sites
          const apexDomain = getApexDomain(`https://${site.customDomain}`);
          const domainCount = await prisma.site.count({
            where: {
              OR: [
                { customDomain: apexDomain },
                { customDomain: { endsWith: `.${apexDomain}` } },
              ],
            },
          });

          // if the apex domain is being used by other sites
          // we should only remove it from our Vercel project
          if (domainCount >= 1) {
            await removeDomainFromVercelProject(site.customDomain);
          } else {
            // this is the only site using this apex domain
            // so we can remove it entirely from our Vercel team
            await removeDomainFromVercelTeam(
              site.customDomain
            );
          }
          
          */
        }
      } else if (key === "subdomain") {
        response = await updateSite({ subdomain: slugify(value) });
      } else if (key === "hasBlog") {
        response = await updateSite({ hasBlog: !!value });
      } else if (key === "image" || key === "logo") {
        if (!process.env.CLOUDINARY_SECRET)
          return { error: "Missing CLOUDINARY_SECRET" };

        const file = formData.get(key) as File;
        if (!file.size) return { error: "Selectionner un fichier valide" };

        const url = await upload(file, {
          tags: [key === "image" ? "banner" : key],
          folder: Niche.key,
        });

        const blurhash = key === "image" ? await getBlurDataURL(url) : null;

        response = await updateSite({
          [key]: url,
          ...(blurhash && { imageBlurhash: blurhash }),
        });
      } else {
        response = await updateSite({ [key]: value });
      }

      console.log(
        "Updated site data! Revalidating tags: ",
        `${site.subdomain}.${Niche.domain}-metadata`,
        `${site.customDomain}-metadata`,
      );
      await revalidateTag(`${site.subdomain}.${Niche.domain}-metadata`);
      site.customDomain &&
        (await revalidateTag(`${site.customDomain}-metadata`));

      return response;
    } catch (error: any) {
      if (error.code === "P2002")
        return { error: `Le site "${key}" est déjà pris!` };
      else return { error: error.message };
    }
  },
);

export const deleteSite = withSiteAuth(async (_: FormData, site: Site) => {
  try {
    const response = await prisma.site.delete({
      where: { id: site.id },
    });
    await revalidateTag(`${site.subdomain}.${Niche.domain}-metadata`);
    response.customDomain &&
      (await revalidateTag(`${site.customDomain}-metadata`));
    return response;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
});

export const getSiteFromPostId = async (postId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      site: {
        select: {
          id: true,
          hasBlog: true,
        },
      },
    },
  });
  return post?.site;
};

export const getSiteFromId = async (id: string) => {
  const site = await prisma.site.findUnique({
    where: { id },
    select: {
      id: true,
      hasBlog: true,
    },
  });
  return site;
};

export const getFirstSiteFromUserId = async (userId: string) => {
  const site = await prisma.site.findFirst({
    where: { userId },
    select: {
      id: true,
      hasBlog: true,
    },
  });
  return site;
};

export const createPost = withSiteAuth(async (_: FormData, site: Site) => {
  const user = await getUser();
  if (!user?.id) return { error: "Not authenticated" };

  const response = await prisma.post.create({
    data: {
      siteId: site.id,
      userId: user.id,
    },
  });

  await revalidateTag(`${site.subdomain}.${Niche.domain}-posts`);
  site.customDomain && (await revalidateTag(`${site.customDomain}-posts`));

  return response;
});

// creating a separate function for this because we're not using FormData
export const updatePost = async (data: Post) => {
  const user = await getUser();
  if (!user?.id) return { error: "Not authenticated" };

  const post = await prisma.post.findUnique({
    where: { id: data.id },
    include: {
      site: true,
    },
  });
  if (!post || post.userId !== user.id) {
    return {
      error: "Post not found",
    };
  }
  try {
    const response = await prisma.post.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
      },
    });

    await revalidateTag(`${post.site?.subdomain}.${Niche.domain}-posts`);
    await revalidateTag(`${post.site?.subdomain}.${Niche.domain}-${post.slug}`);

    // if the site has a custom domain, we need to revalidate those tags too
    post.site?.customDomain &&
      (await revalidateTag(`${post.site?.customDomain}-posts`),
      await revalidateTag(`${post.site?.customDomain}-${post.slug}`));

    return response;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};

export const updatePostMetadata = withPostAuth(
  async (
    formData: FormData,
    post: Post & {
      site: Site;
    },
    key: string,
  ) => {
    const value = formData.get(key) as string;

    try {
      let response;
      if (key === "image") {
        if (!process.env.CLOUDINARY_SECRET)
          return { error: "Missing CLOUDINARY_SECRET" };

        const file = formData.get(key) as File;
        if (!file.size) return { error: "Selectionner un fichier valide" };

        const url = await upload(file, {
          tags: ["post"],
          folder: Niche.key,
        });

        const blurhash = await getBlurDataURL(url);

        response = await prisma.post.update({
          where: { id: post.id },
          data: {
            [key]: url,
            ...(blurhash && { imageBlurhash: blurhash }),
          },
        });
      } else {
        response = await prisma.post.update({
          where: { id: post.id },
          data: {
            [key]: key === "published" ? value === "true" : value,
          },
        });
      }

      await revalidateTag(`${post.site?.subdomain}.${Niche.domain}-posts`);
      await revalidateTag(
        `${post.site?.subdomain}.${Niche.domain}-${post.slug}`,
      );

      // if the site has a custom domain, we need to revalidate those tags too
      post.site?.customDomain &&
        (await revalidateTag(`${post.site?.customDomain}-posts`),
        await revalidateTag(`${post.site?.customDomain}-${post.slug}`));

      return response;
    } catch (error: any) {
      if (error.code === "P2002")
        return { error: `This slug is already in use` };
      else return { error: error.message };
    }
  },
);

export const deletePost = withPostAuth(async (_: FormData, post: Post) => {
  try {
    const response = await prisma.post.delete({
      where: { id: post.id },
      select: {
        siteId: true,
      },
    });
    return response;
  } catch (error: any) {
    return { error: error.message };
  }
});

export const editUser = async (
  formData: FormData,
  _id: unknown,
  key: string,
) => {
  const user = await getUser();
  if (!user?.id) return { error: "Not authenticated" };

  const value = formData.get(key) as string;

  try {
    const response = await prisma.user.update({
      where: { id: user.id },
      data: {
        [key]: value,
      },
    });
    return response;
  } catch (error: any) {
    if (error.code === "P2002")
      return { error: `This ${key} is already in use` };
    else return { error: error.message };
  }
};
