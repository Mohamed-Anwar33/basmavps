/**
 * Custom Error Creation Utility
 * Creates standardized error objects for the application
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message)
    
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = isOperational
    
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Creates a new AppError instance
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {boolean} isOperational - Whether the error is operational
 * @returns {AppError} New AppError instance
 */
export const createError = (message, statusCode = 500, isOperational = true) => {
  return new AppError(message, statusCode, isOperational)
}

/**
 * Common error creators for frequent use cases
 */
export const createValidationError = (message) => createError(message, 400)
export const createUnauthorizedError = (message = 'Unauthorized') => createError(message, 401)
export const createForbiddenError = (message = 'Forbidden') => createError(message, 403)
export const createNotFoundError = (message = 'Resource not found') => createError(message, 404)
export const createConflictError = (message) => createError(message, 409)
export const createInternalServerError = (message = 'Internal server error') => createError(message, 500)

export default createError
