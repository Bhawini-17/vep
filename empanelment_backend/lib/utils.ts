import { ApiResponse } from '../types/application';

export const createSuccessResponse = <T>(
  data: T,
  message?: string,
  pagination?: any
): ApiResponse<T> => ({
  success: true,
  data,
  message,
  pagination,
});

export const createErrorResponse = (
  error: string,
  message?: string
): ApiResponse => ({
  success: false,
  error,
  message,
});

export const handleApiError = (error: any): ApiResponse => {
  console.error('API Error:', error);
  
  if (error.name === 'ZodError') {
    return createErrorResponse(
      'Validation Error',
      error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
    );
  }
  
  return createErrorResponse(
    'Internal Server Error',
    error.message || 'An unexpected error occurred'
  );
};

export const parseQuery = (query: any) => {
  const parsed: any = {};
  
  Object.entries(query).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Try to parse numbers
      if (!isNaN(Number(value))) {
        parsed[key] = Number(value);
      } else {
        parsed[key] = value;
      }
    } else {
      parsed[key] = value;
    }
  });
  
  return parsed;
};