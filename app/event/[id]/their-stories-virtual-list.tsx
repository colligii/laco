'use client';

import { StoryResponse } from '@/app/api/story/status/route';
import { memo, useEffect, useRef, useState } from 'react';
import { Grid, type CellComponentProps } from 'react-window';



type TheirStoriesVirtualListProps = {
  stories: StoryResponse[];
  onClick: (user_id: string, storyIds: string[]) => void
};

type TheirStoryCellProps = CellComponentProps<{ stories: StoryResponse[], onClick: (user_id: string, storyIds: string[]) => void }>;

const ITEM_WIDTH = 88;
const ITEM_HEIGHT = 96;

const TheirStoryCell = memo(function TheirStoryCell({ columnIndex, stories, style, onClick }: TheirStoryCellProps) {
  const story = stories[columnIndex];

  if (!story) return null;

  return (
    <div onClick={() => onClick(story.user_id, story.story_ids)} style={style} className="flex items-start justify-center">
      <div className="flex w-[72px] flex-col items-center gap-2">
        <div className="relative">
          <img
            src={story.avatar_path}
            style={{ borderColor: story.not_viewed ? 'green' : undefined }}
            className="w-16 h-16 rounded-full object-cover border-2 p-0.5"
            alt={`${story.firstName} ${story.lastName}`}
          />
        </div>
        <span className="text-xs text-zinc-300 font-normal text-center truncate w-full">
          {story.firstName} {story.lastName}
        </span>
      </div>
    </div>
  );
});

export default function TheirStoriesVirtualList({ stories, onClick }: TheirStoriesVirtualListProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(320);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width ?? 320;
      if (nextWidth > 0) {
        setContainerWidth(nextWidth);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!stories.length) return null;

  return (
    <div ref={containerRef} className="min-w-0 flex-1 h-24">
      <Grid
        cellComponent={TheirStoryCell}
        cellProps={{ stories, onClick }}
        className="no-scrollbar"
        columnCount={stories.length}
        columnWidth={ITEM_WIDTH}
        defaultHeight={ITEM_HEIGHT}
        defaultWidth={containerWidth}
        overscanCount={3}
        rowCount={1}
        rowHeight={ITEM_HEIGHT}
        style={{ width: containerWidth, height: ITEM_HEIGHT }}
      />
    </div>
  );
}
