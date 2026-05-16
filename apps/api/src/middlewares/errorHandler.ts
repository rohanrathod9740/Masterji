import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
  status?: number;
  body?: unknown;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  console.error(err.stack);

  // If headers have already been sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle SyntaxError from express.json() (e.g. invalid JSON)
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    'body' in err
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload format',
    });
  }

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};