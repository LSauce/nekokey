import { useMisskeyApi } from '@/lib/api';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { Endpoints } from 'misskey-js';

export type TimelineEndpoint = keyof Pick<
  Endpoints,
  | 'notes/timeline'
  | 'notes/global-timeline'
  | 'notes/local-timeline'
  | 'notes/hybrid-timeline'
  | 'notes/user-list-timeline'
  | 'users/notes'
>;

export type TimelineParam = {
  userId?: string;
  withChannelNotes?: boolean;
  withFiles: boolean;
  withRenotes: boolean;
  withReplies: boolean;
};

export const useInfiniteTimelines = (
  endpoint: TimelineEndpoint,
  param?: TimelineParam | undefined,
) => {
  const api = useMisskeyApi();

  return useInfiniteQuery({
    queryKey: [endpoint, param],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      if (!api) throw new Error('API not initialized');
      return await api.request<'notes/timeline', Endpoints[TimelineEndpoint]['req']>(
        endpoint as 'notes/timeline',
        {
          limit: 20,
          untilId: pageParam,
          ...param,
        },
      );
    },
    placeholderData: keepPreviousData,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      return lastPage[lastPage.length - 1].id;
    },
    select: (data) => data.pages.flat(),
  });
};
