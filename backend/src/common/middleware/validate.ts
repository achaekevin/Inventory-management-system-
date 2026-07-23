import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import { ValidationError } from '../errors/AppError';

export const validate = (schema: ZodObject<any>) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = (error as any).issues ? (error as any).issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })) : [];

        next(new ValidationError('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };
};
