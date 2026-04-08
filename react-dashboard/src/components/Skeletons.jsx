import React, { memo } from 'react';

/* ── Skeleton shape variants ── */
const SkeletonBox = ({ className = '' }) => (
  <div
    aria-hidden="true"
    className={`bg-white/[0.06] rounded animate-pulse ${className}`}
  />
);

/* ── Single PlayerCard skeleton ── */
export const PlayerCardSkeleton = () => (
  <div className="card-base rounded-xl overflow-hidden flex flex-col" aria-hidden="true">
    <div className="h-[3px] w-full bg-white/[0.06]" />
    <div className="p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <SkeletonBox className="w-12 h-12 rounded-full flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <SkeletonBox className="h-3.5 w-3/4 rounded" />
          <SkeletonBox className="h-2.5 w-1/2 rounded" />
          <SkeletonBox className="h-5 w-16 rounded-full" />
        </div>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <SkeletonBox key={i} className="flex-1 h-12 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

/* ── Player grid skeleton (n cards) ── */
export const PlayerGridSkeleton = memo(({ count = 8 }) => (
  <div
    role="status"
    aria-label="Loading players…"
    aria-busy="true"
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
  >
    {Array.from({ length: count }).map((_, i) => (
      <PlayerCardSkeleton key={i} />
    ))}
    <span className="sr-only">Loading players, please wait…</span>
  </div>
));

/* ── MatchCard skeleton ── */
const MatchCardSkeleton = () => (
  <div className="card-base rounded-xl overflow-hidden flex flex-col" aria-hidden="true">
    <div className="flex items-center justify-between px-3.5 py-2 bg-white/[0.02] border-b border-icc-border">
      <SkeletonBox className="h-3 w-20 rounded" />
      <SkeletonBox className="h-5 w-14 rounded-full" />
    </div>
    <div className="p-3.5 flex flex-col gap-2.5">
      <div className="flex gap-2">
        <div className="flex-1 flex flex-col gap-2 p-2.5 bg-white/[0.03] rounded-lg">
          <SkeletonBox className="w-9 h-6 rounded" />
          <SkeletonBox className="h-3 w-16 rounded" />
        </div>
        <div className="w-6 flex items-center justify-center">
          <SkeletonBox className="w-4 h-3 rounded" />
        </div>
        <div className="flex-1 flex flex-col gap-2 p-2.5 bg-white/[0.03] rounded-lg items-end">
          <SkeletonBox className="w-9 h-6 rounded" />
          <SkeletonBox className="h-3 w-16 rounded" />
        </div>
      </div>
      <SkeletonBox className="h-3 w-2/3 mx-auto rounded" />
      <div className="grid grid-cols-2 gap-1.5">
        <SkeletonBox className="h-9 rounded-md" />
        <SkeletonBox className="h-9 rounded-md" />
      </div>
    </div>
  </div>
);

/* ── Matches grid skeleton ── */
export const MatchesGridSkeleton = memo(({ count = 12 }) => (
  <div
    role="status"
    aria-label="Loading matches…"
    aria-busy="true"
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
  >
    {Array.from({ length: count }).map((_, i) => (
      <MatchCardSkeleton key={i} />
    ))}
    <span className="sr-only">Loading matches, please wait…</span>
  </div>
));

/* ── Stats table skeleton ── */
export const StatsTableSkeleton = memo(() => (
  <div
    role="status"
    aria-label="Loading statistics…"
    aria-busy="true"
    className="card-base rounded-xl overflow-hidden p-4 flex flex-col gap-3"
  >
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <SkeletonBox className="h-4 w-4 rounded" />
        <SkeletonBox className="h-3 flex-1 rounded" />
        <SkeletonBox className="h-3 w-16 rounded" />
        <SkeletonBox className="h-3 w-10 rounded" />
        <SkeletonBox className="h-3 w-8 rounded" />
        <SkeletonBox className="h-3 w-10 rounded" />
        <SkeletonBox className="h-1.5 w-16 rounded-full" />
      </div>
    ))}
    <span className="sr-only">Loading statistics, please wait…</span>
  </div>
));

/* ── Hero KPI skeleton ── */
export const KPIGridSkeleton = memo(() => (
  <div
    role="status"
    aria-label="Loading statistics…"
    aria-busy="true"
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
  >
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="card-base rounded-xl p-5 flex items-start gap-3" aria-hidden="true">
        <SkeletonBox className="w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <SkeletonBox className="h-6 w-20 rounded" />
          <SkeletonBox className="h-3 w-28 rounded" />
          <SkeletonBox className="h-2.5 w-20 rounded" />
        </div>
      </div>
    ))}
    <span className="sr-only">Loading key statistics…</span>
  </div>
));

/* ── Generic section error state ── */
export const SectionError = ({ message = 'Failed to load this section.', onRetry }) => (
  <div
    role="alert"
    aria-live="polite"
    className="flex flex-col items-center justify-center gap-3 py-16 text-center"
  >
    <span className="text-2xl" aria-hidden="true">⚠️</span>
    <p className="text-sm text-icc-muted">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="btn-outline-gold text-xs px-4 py-2"
        aria-label="Retry loading this section"
      >
        Retry
      </button>
    )}
  </div>
);

/* ── Empty state ── */
export const EmptyState = ({ message = 'No results found.', icon = '🔍' }) => (
  <div
    role="status"
    aria-live="polite"
    className="flex flex-col items-center justify-center gap-3 py-16 text-center col-span-full"
  >
    <span className="text-3xl" aria-hidden="true">{icon}</span>
    <p className="text-sm text-icc-muted">{message}</p>
  </div>
);
