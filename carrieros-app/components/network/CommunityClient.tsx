"use client";

import { useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import { COMMUNITY_POST_KIND_LABEL } from "@/components/network/labels";
import {
  createCommunityPost,
  listCommunityPosts,
} from "@/lib/network/store";
import type { CommunityPost, CommunityPostKind } from "@/lib/network/types";
import {
  NETWORK_OWNER_MEMBER_ID,
  seedMembers,
} from "@/lib/network/seed";

const KINDS: CommunityPostKind[] = [
  "update",
  "news",
  "hiring",
  "promotion",
  "training",
  "webinar",
  "education",
];

export default function CommunityClient({
  initial,
}: {
  initial: CommunityPost[];
}) {
  const [posts, setPosts] = useState(initial);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<CommunityPostKind>("update");
  const owner = seedMembers.find((m) => m.id === NETWORK_OWNER_MEMBER_ID)!;

  function refresh() {
    setPosts([...listCommunityPosts()]);
  }

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    createCommunityPost({
      authorMemberId: owner.id,
      authorName: owner.displayName,
      authorCategory: owner.category,
      kind,
      title: title.trim(),
      body: body.trim(),
    });
    setTitle("");
    setBody("");
    refresh();
  }

  return (
    <div className="space-y-5">
      <form
        onSubmit={onCreate}
        className="space-y-3 rounded-[16px] bg-[#F8F9FB] p-4 sm:p-5"
      >
        <h3 className="text-[15px] font-semibold text-[#111827]">
          Share with verified businesses
        </h3>
        <div className="grid gap-2 sm:grid-cols-[160px_1fr]">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as CommunityPostKind)}
            className="rounded-[10px] bg-white px-3 py-2 text-[13px] outline-none ring-1 ring-[#E5E7EB]"
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {COMMUNITY_POST_KIND_LABEL[k]}
              </option>
            ))}
          </select>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Headline"
            className="rounded-[10px] bg-white px-3 py-2 text-[14px] outline-none ring-1 ring-[#E5E7EB] focus:ring-2 focus:ring-[#93C5FD]"
          />
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Update, hiring note, training event, or educational tip…"
          className="w-full rounded-[10px] bg-white px-3 py-2 text-[14px] outline-none ring-1 ring-[#E5E7EB] focus:ring-2 focus:ring-[#93C5FD]"
        />
        <button type="submit" className="transpo-btn-primary text-[13px]">
          Publish to feed
        </button>
      </form>

      {!posts.length ? (
        <EmptyState
          title="Community is quiet"
          description="Verified businesses share updates, hiring, promotions, and training here."
        />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <article key={post.id} className="rounded-[16px] bg-[#F8F9FB] p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[14px] font-semibold text-[#111827]">
                  {post.authorName}
                </span>
                <span className="rounded-full bg-white px-2.5 py-1 text-[12px] font-medium text-[#475569] shadow-[inset_0_0_0_1px_#E5E7EB]">
                  {COMMUNITY_POST_KIND_LABEL[post.kind]}
                </span>
                <span className="text-[12px] text-[#94A3B8]">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="mt-2 text-[15px] font-semibold text-[#111827]">
                {post.title}
              </h3>
              <p className="mt-1 text-[14px] leading-relaxed text-[#475569]">
                {post.body}
              </p>
              <p className="mt-3 text-[12px] text-[#6B7280]">
                {post.likes} appreciations · followers can see this feed
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
