import { Response } from 'express';
import { ApiResponse, ApiError, ApiSuccess } from '@/types/api';

/**
 * Send a successful API response
 */
export function sendSuccess<T>(
  res: Response, 
  data?: T, 
  message?: string, 
  statusCode: number = 200
): void {
  const response: ApiSuccess<T> = {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data })
  };
  
  res.status(statusCode).json(response);
}

/**
 * Send an error API response
 */
export function sendError(
  res: Response, 
  error: string, 
  statusCode: number = 500, 
  details?: any
): void {
  const response: ApiError = {
    success: false,
    error,
    ...(details && { details })
  };
  
  res.status(statusCode).json(response);
}

/**
 * Send a validation error response
 */
export function sendValidationError(
  res: Response, 
  errors: any[], 
  message: string = 'Validation failed'
): void {
  sendError(res, message, 400, errors);
}

/**
 * Send a not found error response
 */
export function sendNotFound(res: Response, resource: string = 'Resource'): void {
  sendError(res, `${resource} not found`, 404);
}

/**
 * Send an unauthorized error response
 */
export function sendUnauthorized(res: Response, message: string = 'Unauthorized'): void {
  sendError(res, message, 401);
}

/**
 * Send a forbidden error response
 */
export function sendForbidden(res: Response, message: string = 'Forbidden'): void {
  sendError(res, message, 403);
}

/**
 * Send a conflict error response
 */
export function sendConflict(res: Response, message: string = 'Conflict'): void {
  sendError(res, message, 409);
}

/**
 * Send a bad request error response
 */
export function sendBadRequest(res: Response, message: string = 'Bad request'): void {
  sendError(res, message, 400);
}

/**
 * Handle async route errors
 */
export function asyncHandler<T extends any[]>(
  fn: (...args: T) => Promise<any>
) {
  return (...args: T): void => {
    const [, , next] = args as any[];
    Promise.resolve(fn(...args)).catch(next);
  };
}

/**
 * Create a standardized API response
 */
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  message?: string,
  error?: string,
  details?: any
): ApiResponse<T> {
  return {
    success,
    ...(data !== undefined && { data }),
    ...(message && { message }),
    ...(error && { error }),
    ...(details && { details })
  };
}

/**
 * Send paginated response
 */
export function sendPaginatedResponse<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): void {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const response = {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage
    },
    ...(message && { message })
  };

  res.json(response);
}

/**
 * Type guard to check if response is an error
 */
export function isApiError(response: ApiResponse): response is ApiError {
  return response.success === false;
}

/**
 * Type guard to check if response is successful
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.success === true;
}