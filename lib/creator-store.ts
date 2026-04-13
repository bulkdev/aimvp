import { randomUUID } from "crypto";
import type {
  CreatorComment,
  CreatorReaction,
  CreatorSavedVideo,
  CreatorSubscription,
  CreatorVideo,
  CreatorWatchHistory,
  Project,
} from "@/types";
import { getProject, getProjectByPublicSlug, updateProject } from "@/lib/store";

export type CreatorSort = "newest" | "oldest" | "most-viewed" | "most-engagement";

function ensureCreator(project: Project) {
  const cm = project.content.assets?.creatorMembership;
  if (!cm) return null;
  return cm;
}

export async function getCreatorProjectBySlugOrId(input: { slug?: string; id?: string }) {
  if (input.slug) return getProjectByPublicSlug(input.slug);
  if (input.id) return getProject(input.id);
  return null;
}

export function listCreatorVideos(
  project: Project,
  opts: { search?: string; category?: string; sort?: CreatorSort; includeMembers?: boolean; cursor?: number; limit?: number }
) {
  const cm = ensureCreator(project);
  if (!cm) return { items: [] as CreatorVideo[], nextCursor: null as number | null };
  let rows = [...(cm.videos ?? [])];
  if (!opts.includeMembers) rows = rows.filter((v) => v.visibility !== "member");
  if (opts.search?.trim()) {
    const q = opts.search.toLowerCase();
    rows = rows.filter((v) => `${v.title} ${v.description} ${v.tags.join(" ")}`.toLowerCase().includes(q));
  }
  if (opts.category?.trim()) rows = rows.filter((v) => v.category === opts.category);
  const sort = opts.sort ?? "newest";
  rows.sort((a, b) => {
    if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
    if (sort === "most-viewed") return b.views - a.views;
    if (sort === "most-engagement") return b.engagementScore - a.engagementScore;
    return b.createdAt.localeCompare(a.createdAt);
  });
  const start = Math.max(0, opts.cursor ?? 0);
  const limit = Math.max(1, Math.min(30, opts.limit ?? 12));
  const items = rows.slice(start, start + limit);
  const nextCursor = start + limit < rows.length ? start + limit : null;
  return { items, nextCursor };
}

export function getWatchForUser(project: Project, userId: string | undefined) {
  const cm = ensureCreator(project);
  if (!cm || !userId) return [] as CreatorWatchHistory[];
  return (cm.watchHistory ?? []).filter((w) => w.userId === userId);
}

export async function updateWatchProgress(input: {
  projectId: string;
  userId: string;
  videoId: string;
  progressPct: number;
  watchSecDelta?: number;
}) {
  const project = await getProject(input.projectId);
  if (!project) throw new Error("Project not found.");
  const cm = ensureCreator(project);
  if (!cm) throw new Error("Creator membership data is not configured.");
  const now = new Date().toISOString();
  const list = [...(cm.watchHistory ?? [])];
  const idx = list.findIndex((w) => w.userId === input.userId && w.videoId === input.videoId);
  const bounded = Math.max(0, Math.min(100, input.progressPct));
  const completed = bounded >= 80;
  const watchSec = Math.max(0, Math.round(input.watchSecDelta ?? 0));
  if (idx >= 0) {
    const prev = list[idx];
    const cooldownMs = 45_000;
    const since = Date.now() - new Date(prev.updatedAt).getTime();
    const addSec = since < cooldownMs ? 0 : watchSec;
    list[idx] = {
      ...prev,
      progressPct: Math.max(prev.progressPct, bounded),
      completed: prev.completed || completed,
      totalWatchSec: prev.totalWatchSec + addSec,
      updatedAt: now,
    };
  } else {
    list.push({
      id: randomUUID(),
      projectId: project.id,
      userId: input.userId,
      videoId: input.videoId,
      progressPct: bounded,
      completed,
      totalWatchSec: watchSec,
      updatedAt: now,
    });
  }
  await updateProject(project.id, {
    content: {
      ...project.content,
      assets: {
        ...project.content.assets,
        creatorMembership: {
          ...cm,
          watchHistory: list,
        },
      },
    },
  });
}

export async function addCreatorComment(input: {
  projectId: string;
  videoId: string;
  userId: string;
  authorName?: string;
  body: string;
  parentId?: string;
  isCreator?: boolean;
}) {
  const project = await getProject(input.projectId);
  if (!project) throw new Error("Project not found.");
  const cm = ensureCreator(project);
  if (!cm) throw new Error("Creator membership data is not configured.");
  const next: CreatorComment = {
    id: randomUUID(),
    projectId: input.projectId,
    videoId: input.videoId,
    userId: input.userId,
    authorName: input.authorName,
    body: input.body.trim(),
    parentId: input.parentId,
    isCreator: Boolean(input.isCreator),
    highlightedByCreator: false,
    createdAt: new Date().toISOString(),
  };
  await updateProject(project.id, {
    content: {
      ...project.content,
      assets: {
        ...project.content.assets,
        creatorMembership: {
          ...cm,
          comments: [...(cm.comments ?? []), next],
        },
      },
    },
  });
  return next;
}

export async function addReaction(input: {
  projectId: string;
  userId: string;
  emoteCode: string;
  commentId?: string;
  videoId?: string;
}) {
  const project = await getProject(input.projectId);
  if (!project) throw new Error("Project not found.");
  const cm = ensureCreator(project);
  if (!cm) throw new Error("Creator membership data is not configured.");
  const row: CreatorReaction = {
    id: randomUUID(),
    projectId: input.projectId,
    userId: input.userId,
    emoteCode: input.emoteCode,
    commentId: input.commentId,
    videoId: input.videoId,
    createdAt: new Date().toISOString(),
  };
  await updateProject(project.id, {
    content: {
      ...project.content,
      assets: {
        ...project.content.assets,
        creatorMembership: {
          ...cm,
          reactions: [...(cm.reactions ?? []), row],
        },
      },
    },
  });
  return row;
}

export async function upsertSubscription(input: CreatorSubscription) {
  const project = await getProject(input.projectId);
  if (!project) throw new Error("Project not found.");
  const cm = ensureCreator(project);
  if (!cm) throw new Error("Creator membership data is not configured.");
  const list = [...(cm.subscriptions ?? [])];
  const idx = list.findIndex((s) => s.id === input.id || (s.userId === input.userId && s.planId === input.planId));
  if (idx >= 0) list[idx] = { ...list[idx], ...input, updatedAt: new Date().toISOString() };
  else list.push(input);
  await updateProject(project.id, {
    content: {
      ...project.content,
      assets: {
        ...project.content.assets,
        creatorMembership: {
          ...cm,
          subscriptions: list,
        },
      },
    },
  });
}

export async function toggleSavedVideo(input: { projectId: string; userId: string; videoId: string }) {
  const project = await getProject(input.projectId);
  if (!project) throw new Error("Project not found.");
  const cm = ensureCreator(project);
  if (!cm) throw new Error("Creator membership data is not configured.");
  const list = [...(cm.savedVideos ?? [])];
  const idx = list.findIndex((s) => s.userId === input.userId && s.videoId === input.videoId);
  if (idx >= 0) list.splice(idx, 1);
  else {
    const row: CreatorSavedVideo = {
      id: randomUUID(),
      projectId: input.projectId,
      userId: input.userId,
      videoId: input.videoId,
      createdAt: new Date().toISOString(),
    };
    list.push(row);
  }
  await updateProject(project.id, {
    content: {
      ...project.content,
      assets: {
        ...project.content.assets,
        creatorMembership: {
          ...cm,
          savedVideos: list,
        },
      },
    },
  });
}

