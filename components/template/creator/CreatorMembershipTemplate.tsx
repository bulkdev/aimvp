import type { Project } from "@/types";
import { creatorAssets } from "@/lib/creator-membership";
import CreatorHomeFeedClient from "@/components/template/creator/pages/CreatorHomeFeedClient";

export default function CreatorMembershipTemplate({
  project,
  publishedBasePath,
  isSubscriber = false,
}: {
  project: Project;
  publishedBasePath?: string;
  isSubscriber?: boolean;
}) {
  const cm = creatorAssets(project.content);
  const basePath = publishedBasePath || `/site/${project.id}`;
  return (
    <CreatorHomeFeedClient
      videos={cm.videos}
      comments={cm.comments}
      reactions={cm.reactions}
      isSubscriber={isSubscriber}
      basePath={basePath}
    />
  );
}

