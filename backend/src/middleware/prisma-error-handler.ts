import { Prisma } from '@prisma/client';
import { APIError } from './error';

/**
 * Handles Prisma errors and converts them to appropriate API errors
 */
export function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        const target = (error.meta?.target as string[])?.join(', ') || 'field';
        throw APIError.conflict(`A record with this ${target} already exists`);

      case 'P2003': // Foreign key constraint violation
        throw APIError.badRequest('Related record not found');

      case 'P2025': // Record not found
        throw APIError.notFound('Record not found');

      case 'P2014': // Invalid relation
        throw APIError.badRequest('Invalid relationship');

      case 'P2034': // Transaction conflict
        throw APIError.conflict('Operation conflict, please retry');

      case 'P2024': // Timeout
        throw new APIError(408, 'Request timed out', 'TIMEOUT');

      default:
        console.error('Unhandled Prisma error:', error.code, error.message);
        throw APIError.internal('Database operation failed');
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw APIError.badRequest('Invalid data provided');
  }

  throw error;
}

/**
 * Wraps a Prisma transaction with error handling and timeout
 */
export async function transactionWithErrorHandling<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: { maxWait?: number; timeout?: number }
): Promise<T> {
  const { prisma } = await import('../lib/prisma');

  try {
    return await prisma.$transaction(fn, {
      maxWait: options?.maxWait ?? 5000,
      timeout: options?.timeout ?? 10000,
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Extracts user-friendly message from Prisma error
 */
export function getPrismaErrorMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.message;
  }
  return 'An unexpected database error occurred';
}
