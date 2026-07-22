import config from '../../config/env';

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  pageSize: number;
}

export const getPaginationParams = (params: PaginationParams): PaginationResult => {
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.min(
    config.MAX_PAGE_SIZE,
    Math.max(1, Number(params.pageSize) || config.DEFAULT_PAGE_SIZE)
  );

  const skip = (page - 1) * pageSize;

  return {
    skip,
    take: pageSize,
    page,
    pageSize,
  };
};

export const getSortParams = (params: PaginationParams): any => {
  if (!params.sortBy) {
    return { createdAt: 'desc' };
  }

  return {
    [params.sortBy]: params.sortOrder || 'asc',
  };
};
