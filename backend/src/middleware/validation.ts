import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

export const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateCreateLog = [
  body('level')
    .isIn(['INFO', 'WARN', 'ERROR', 'DEBUG'])
    .withMessage('Level must be one of: INFO, WARN, ERROR, DEBUG'),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message must be less than 1000 characters'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be a valid JSON object'),
  handleValidationErrors
];

export const validateCreateTrace = [
  body('root_span_name')
    .notEmpty()
    .withMessage('Root span name is required')
    .isLength({ max: 255 })
    .withMessage('Root span name must be less than 255 characters'),
  body('start_time_unix_nano')
    .isNumeric()
    .withMessage('Start time must be a valid number'),
  body('duration_nano')
    .isNumeric()
    .withMessage('Duration must be a valid number'),
  body('span_count')
    .isInt({ min: 1 })
    .withMessage('Span count must be a positive integer'),
  handleValidationErrors
];

export const validateCreateSpan = [
  body('trace_id')
    .isUUID()
    .withMessage('Trace ID must be a valid UUID'),
  body('parent_span_id')
    .optional()
    .isUUID()
    .withMessage('Parent span ID must be a valid UUID'),
  body('name')
    .notEmpty()
    .withMessage('Span name is required')
    .isLength({ max: 255 })
    .withMessage('Span name must be less than 255 characters'),
  body('start_time_unix_nano')
    .isNumeric()
    .withMessage('Start time must be a valid number'),
  body('end_time_unix_nano')
    .isNumeric()
    .withMessage('End time must be a valid number'),
  body('attributes')
    .optional()
    .isObject()
    .withMessage('Attributes must be a valid JSON object'),
  handleValidationErrors
]; 