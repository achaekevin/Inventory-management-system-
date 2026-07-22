import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../errors/AppError';

/**
 * Middleware to handle 404 Not Found errors
 * Should be placed after all route definitions
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};
