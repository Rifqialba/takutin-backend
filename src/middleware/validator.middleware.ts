import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';
import Logger from '../utils/logger';

export const validate = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.issues.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }
      Logger.error('Unexpected validation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Validation error'
      });
    }
  };
};