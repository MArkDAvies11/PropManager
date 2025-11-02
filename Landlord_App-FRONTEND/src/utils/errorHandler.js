/**
 * Professional error handling utilities for frontend
 */

export const ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR'
};

export const ERROR_MESSAGES = {
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email or password. Please check your credentials and try again.',
  [ERROR_CODES.EMAIL_EXISTS]: 'An account with this email already exists. Please use a different email or try logging in.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ERROR_CODES.ACCOUNT_DISABLED]: 'Your account has been disabled. Please contact support for assistance.',
  [ERROR_CODES.SERVER_ERROR]: 'Something went wrong on our end. Please try again in a few moments.',
  [ERROR_CODES.NETWORK_ERROR]: 'Unable to connect to our servers. Please check your internet connection and try again.'
};

export const getErrorMessage = (error) => {
  // Handle network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR];
  }
  
  // Handle API errors with codes
  if (error.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }
  
  // Handle API errors with messages
  if (error.error || error.message) {
    return error.error || error.message;
  }
  
  // Default fallback
  return ERROR_MESSAGES[ERROR_CODES.SERVER_ERROR];
};