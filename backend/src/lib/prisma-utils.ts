/**
 * Generic pagination helper for Prisma queries
 */
export function getPagination(page: number = 1, limit: number = 20) {
  const safeLimit = Math.min(Math.max(1, limit), 100);
  const safePage = Math.max(1, page);

  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  };
}

/**
 * Add soft delete filter to where clause
 */
export function withoutDeleted<T extends object>(where: T): T & { deletedAt: null } {
  return { ...where, deletedAt: null };
}

/**
 * Build date range filter
 */
export function dateRange(start?: Date | string, end?: Date | string) {
  const filter: { gte?: Date; lte?: Date } = {};

  if (start) {
    filter.gte = new Date(start);
  }
  if (end) {
    filter.lte = new Date(end);
  }

  return Object.keys(filter).length > 0 ? filter : undefined;
}

/**
 * Build search filter across multiple fields
 */
export function buildSearchFilter(fields: string[], term: string) {
  if (!term?.trim()) return undefined;

  return {
    OR: fields.map(field => ({
      [field]: { contains: term, mode: 'insensitive' as const }
    }))
  };
}

/**
 * Calculate pagination metadata for response
 */
export function getPaginationMeta(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
