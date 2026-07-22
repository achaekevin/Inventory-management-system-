import { Response } from 'express';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    pageSize?: number;
    totalPages?: number;
    totalCount?: number;
  };
}

export class ResponseHandler {
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
    meta?: ApiResponse['meta']
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      ...(meta && { meta }),
    };

    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message: string = 'Resource created successfully'): Response {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response, message: string = 'No content'): Response {
    return res.status(204).json({
      success: true,
      message,
    });
  }

  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    pageSize: number,
    totalCount: number,
    message: string = 'Success'
  ): Response {
    const totalPages = Math.ceil(totalCount / pageSize);

    return this.success(
      res,
      data,
      message,
      200,
      {
        page,
        pageSize,
        totalPages,
        totalCount,
      }
    );
  }
}
