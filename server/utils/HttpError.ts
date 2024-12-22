export interface HttpError extends Error {
  status: number;
}

export const HttpError: {
  new (statusCode: number, message?: string): HttpError;
  (statusCode: number, message?: string): HttpError;
} = function (this: any, statusCode: number, message?: string): HttpError {
  if (!(this instanceof HttpError)) {
    return new HttpError(statusCode, message);
  }

  Error.call(this, message);
  this.name = 'HttpError';
  this.status = statusCode;
  this.message = message || 'An error occurred';

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, HttpError);
  }
} as any;

HttpError.prototype = Object.create(Error.prototype);
HttpError.prototype.constructor = HttpError;
