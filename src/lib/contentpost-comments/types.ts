export type CommentModerationStatus = 'ACTIVE' | 'HIDDEN' | 'REMOVED' | 'PENDING_REVIEW' | 'SPAM';

export type ContentPostCommentAuthor = {
  id: string | null;
  displayName: string | null;
  role: string | null;
};

export type ContentPostCommentRecord = {
  id: string;
  postId: string;
  authorId: string | null;
  parentId: string | null;
  body: string;
  depth: number;
  status: CommentModerationStatus;
  createdAt: string;
  updatedAt: string;
  author: ContentPostCommentAuthor | null;
  replies: ContentPostCommentRecord[];
  replyCount: number;
};

export type CommentStats = {
  postId: string;
  totalCount: number;
  visibleCount: number;
  hiddenCount: number;
};

export type CommentPermissions = {
  canComment: boolean;
  canModerate: boolean;
};

export type CommentTreeResponse = CommentStats & {
  comments: ContentPostCommentRecord[];
  permissions: CommentPermissions;
};

export type CreateCommentInput = {
  body: string;
  parentId?: string | null;
};

export type UpdateCommentInput = {
  body: string;
};

export type ModerateCommentInput = {
  action: 'hide' | 'unhide' | 'remove';
  reason?: string | null;
};
