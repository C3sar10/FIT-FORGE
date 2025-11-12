import { Query } from "mongoose";
import { Types } from "mongoose";

export interface PaginationParams {
  limit: number;
  cursor?: string;
  page?: number;
}

export interface CursorPaginationResult<T> {
  items: T[];
  pagination: {
    nextCursor?: string | null;
  };
}

export interface OffsetPaginationResult<T> {
  items: T[];
  pagination: {
    currentPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
    nextPage: number | null;
    previousPage: number | null;
  };
}

export async function applyCursorPagination<T>(
  query: Query<T[], T>,
  params: { limit: number; cursor?: string }
): Promise<CursorPaginationResult<any>> {
  const { limit, cursor } = params;

  if (cursor) {
    query = query.where({ _id: { $lt: new Types.ObjectId(cursor) } });
  }

  const docs = await query.limit(limit + 1).lean();
  const nextCursor =
    docs.length > limit ? String((docs[limit] as any)._id) : null;
  const items = docs.slice(0, limit);

  return {
    items,
    pagination: { nextCursor },
  };
}

export async function applyOffsetPagination<T>(
  query: Query<T[], T>,
  params: { limit: number; page: number }
): Promise<OffsetPaginationResult<any>> {
  const { limit, page } = params;
  const skip = (page - 1) * limit;

  const docs = await query
    .skip(skip)
    .limit(limit + 1)
    .lean();
  const hasNext = docs.length > limit;
  const items = docs.slice(0, limit);

  return {
    items,
    pagination: {
      currentPage: page,
      hasNext,
      hasPrevious: page > 1,
      nextPage: hasNext ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
    },
  };
}
