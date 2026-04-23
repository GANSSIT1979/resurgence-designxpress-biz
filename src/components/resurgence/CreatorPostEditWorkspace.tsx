'use client';

import { useState } from 'react';
import CreatorPostEditForm from '@/components/resurgence/CreatorPostEditForm';
import MediaMetadataPanel from '@/components/resurgence/MediaMetadataPanel';
import type { CreatorPostEditableRecord } from '@/lib/creator-posts/edit-types';

export default function CreatorPostEditWorkspace({
  initialPost,
}: {
  initialPost: CreatorPostEditableRecord;
}) {
  const [post, setPost] = useState<CreatorPostEditableRecord>(initialPost);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_420px] xl:grid-cols-[minmax(0,1.18fr)_460px]">
      <CreatorPostEditForm post={post} onPostUpdated={setPost} />
      <MediaMetadataPanel post={post} />
    </div>
  );
}
