"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Niche } from "@/niche";
import { Post } from "@prisma/client";
import { updatePost, updatePostMetadata } from "@/lib/actions";
import TextareaAutosize from "react-textarea-autosize";
import { cn } from "@/lib/utils";
import LoadingDots from "./icons/loading-dots";
import { Baby, Bold, BoldIcon, CheckCheck, Code, ExternalLink, FoldVertical, Globe2, Heading1Icon, Heading2Icon, Heading3Icon, ImageIcon, Italic, Library, List, ListFilter, ListOrdered, ListTodoIcon, Mic, Minus, MoreHorizontal, MoreVertical, Quote, Shuffle, Smile, Sparkles, SpellCheck2, Strikethrough, TextIcon, TypeIcon } from "lucide-react";
import { toast } from "sonner";
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { useDebounce } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"
import getSelectedText from "@/lib/selectedText";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const Icons = {
  ListFilter, Baby, Library, Bold, BoldIcon, CheckCheck, Code, ExternalLink, FoldVertical, Heading1Icon, Heading2Icon, Heading3Icon, ImageIcon, Italic, List, ListOrdered, ListTodoIcon, Minus, MoreVertical, Quote, Shuffle, Smile, SpellCheck2, Strikethrough, TextIcon, TypeIcon, MoreHorizontal, Mic, Globe2
}

type PostWithSite = Post & { site: { subdomain: string | null } | null };

export default function PostEditor({ post, debounce = 1000 }: { post: PostWithSite, debounce?: number }) {

  let [isPendingSaving, startTransitionSaving] = useTransition();
  let [isPendingPublishing, startTransitionPublishing] = useTransition();
  const [data, setData] = useState<PostWithSite>(post);


  const editor = useEditor({
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none',
      },
    },
    extensions: [
      StarterKit,
      Image,
      getSelectedText
    ],
    content: post.content,
    onUpdate: ({ editor }) => {
      setData({ ...data, content: editor.getHTML() })
    },
  })

  const [debouncedContent] = useDebounce(data.content, debounce);
  const [debouncedTitle] = useDebounce(data.title, debounce);
  const [debouncedDescription] = useDebounce(data.description, debounce);

  useEffect(() => {
    if (
      data.title === post.title &&
      data.description === post.description &&
      data.content === post.content
    )
      return;

    startTransitionSaving(async () => {
      console.log("saving")
      await updatePost(data);
    });

  }, [debouncedContent, debouncedTitle, debouncedDescription]);


  const url = process.env.NEXT_PUBLIC_VERCEL_ENV
    ? `https://${data.site?.subdomain}.${Niche.domain}/${data.slug}`
    : `http://${data.site?.subdomain}.localhost:3000/${data.slug}`;

  // listen to CMD + S and override the default behavior
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "s") {
        e.preventDefault();
        startTransitionSaving(async () => {
          await updatePost(data);
        });
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [data, startTransitionSaving]);

  return (
    <div className="relative min-h-[500px] w-full max-w-screen-lg p-12 px-8 sm:mb-[calc(20vh)] sm:rounded-lg sm:px-12">
      <div className="absolute right-5 top-5 mb-5 flex items-center space-x-3">
        {data.published && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-sm text-stone-400 hover:text-stone-500"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
        <div className="rounded-lg bg-stone-100 px-2 py-1 text-sm text-stone-400 dark:bg-stone-800 dark:text-stone-500">
          {isPendingSaving ? "Enregistrement..." : "Sauvegardé"}
        </div>
        <button
          onClick={() => {
            const formData = new FormData();
            console.log(data.published, typeof data.published);
            formData.append("published", String(!data.published));
            startTransitionPublishing(async () => {
              await updatePostMetadata(formData, post.id, "published").then(
                () => {
                  toast.success(
                    `Article ${data.published ? "désactiver" : "publié"}.`,
                  );
                  setData((prev) => ({ ...prev, published: !prev.published }));
                },
              );
            });
          }}
          className={cn(
            "flex h-7 w-24 items-center justify-center space-x-2 rounded-lg border text-sm transition-all focus:outline-none",
            isPendingPublishing
              ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
              : "border border-black bg-black text-white hover:bg-white hover:text-black active:bg-stone-100 dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
          )}
          disabled={isPendingPublishing}
        >
          {isPendingPublishing ? (
            <LoadingDots />
          ) : (
            <p>{data.published ? "Désactiver" : "Publier"}</p>
          )}
        </button>
      </div>
      <div className="mb-5 flex flex-col space-y-3 border-b border-stone-200 pb-5 dark:border-stone-700">
        <input
          type="text"
          placeholder="Titre"
          defaultValue={post?.title || ""}
          autoFocus
          onChange={(e) => setData({ ...data, title: e.target.value })}
          className="dark:placeholder-text-600 border-none px-0 font-cal text-3xl placeholder:text-stone-400 focus:outline-none focus:ring-0 dark:bg-black dark:text-white"
        />
        <TextareaAutosize
          placeholder="Description"
          defaultValue={post?.description || ""}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          className="dark:placeholder-text-600 w-full resize-none border-none px-0 placeholder:text-stone-400 focus:outline-none focus:ring-0 dark:bg-black dark:text-white"
        />
      </div>
      {editor && <>
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </>}

    </div>
  );
}

const MenuItem = (props: any) => {
  //@ts-ignore
  const Icon = Icons[props.icon]
  return (<Button className="min-w-10 p-0" variant="outline"
    {...props}>
    <Icon width={16} />
  </Button>)
}

const AIItem = (props: any) => {
  //@ts-ignore
  const Icon = Icons[props.icon]
  return (<DropdownMenuItem>
    {Icon && <Icon className="mr-2 h-4 w-4" />}
    <span>{props.text}</span>
  </DropdownMenuItem>)
}

const AISubItem = (props: any) => {
  //@ts-ignore
  const Icon = Icons[props.icon]
  return (<DropdownMenuSub>
    <DropdownMenuSubTrigger>
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      <span>{props.text}</span>
    </DropdownMenuSubTrigger>
    <DropdownMenuPortal>
      <DropdownMenuSubContent>
        {props.children}
      </DropdownMenuSubContent>
    </DropdownMenuPortal>
  </DropdownMenuSub>)
}

const MenuBar = ({ editor }: { editor: Editor }) => {
  if (!editor) return null

  const addImage = useCallback(() => {
    const url = window.prompt('URL')
    if (url) editor?.chain().focus().setImage({ src: url }).run()
  }, [editor])

  const selection = editor.commands.getSelectedText()
  const minSelection = selection.length > 3


  return (<div className="mb-5 flex space-x-2 sticky top-0 bg-accent z-10 p-4 border overflow-x-scroll no-scrollbar">
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={!minSelection}>
        <Button variant="outline" className="min-w-10 p-0 relative">
          <Sparkles className="h-4 w-4" />
          {minSelection && <Badge variant="outline" className="absolute" style={{ top: '-12px', right: '-6px', background: 'deeppink', color: 'white' }}>AI</Badge>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <AIItem icon="CheckCheck" text="Complete" />
        <AIItem icon="FoldVertical" text="Shorten" />
        <AIItem icon="MoreHorizontal" text="Extend" />
        <AIItem icon="Shuffle" text="Rephrase" />
        <AIItem icon="ListFilter" text="Summarize" />
        <AIItem icon="Library" text="tl;dr" />
        <AIItem icon="Baby" text="Simplify" />
        <AIItem icon="SpellCheck2" text="Spelling & Grammar" />
        <AIItem icon="Smile" text="Emojify" />
        <DropdownMenuSeparator />
        <AISubItem icon="Mic" text="Tone of voice">
          <AIItem text="Academic" />
          <AIItem text="Confident" />
          <AIItem text="Excited" />
          <AIItem text="Formal" />
          <AIItem text="Friendly" />
          <AIItem text="Funny" />
        </AISubItem>
        <AISubItem icon="Globe2" text="Translate">
          <AIItem text="English" />
          <AIItem text="German" />
          <AIItem text="French" />
          <AIItem text="Dutch" />
          <AIItem text="Swedish" />
        </AISubItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <MenuItem icon="Heading1Icon" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
    <MenuItem icon="Heading2Icon" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
    <MenuItem icon="Heading3Icon" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
    <MenuItem icon="Bold" onClick={() => editor.chain().focus().toggleBold().run()} />
    <MenuItem icon="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} />
    <MenuItem icon="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} />
    <MenuItem icon="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} />
    <MenuItem icon="ImageIcon" onClick={addImage} />
    <MenuItem icon="List" onClick={() => editor.chain().focus().toggleBulletList().run()} />
    <MenuItem icon="ListOrdered" onClick={() => editor.chain().focus().toggleOrderedList().run()} />
    <MenuItem icon="Code" onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
    <MenuItem icon="Minus" onClick={() => editor.chain().focus().setHorizontalRule().run()} />


  </div>)
}