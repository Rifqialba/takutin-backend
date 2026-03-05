import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message: string = 'Success',
  statusCode: number = 200,
  meta?: ApiResponse['meta']
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta
  });
};

export const sendError = (
  res: Response,
  message: string = 'An error occurred',
  statusCode: number = 500,
  errors?: any[]
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

export const sendUnauthorized = (
  res: Response,
  message: string = 'Unauthorized'
): Response => {
  return res.status(401).json({
    success: false,
    message
  });
};

export const sendForbidden = (
  res: Response,
  message: string = 'Forbidden'
): Response => {
  return res.status(403).json({
    success: false,
    message
  });
};

export const sendNotFound = (
  res: Response,
  message: string = 'Resource not found'
): Response => {
  return res.status(404).json({
    success: false,
    message
  });
};

export const sendConflict = (
  res: Response,
  message: string = 'Resource already exists'
): Response => {
  return res.status(409).json({
    success: false,
    message
  });
};