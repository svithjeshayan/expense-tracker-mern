const mongoSanitize = require('express-mongo-sanitize');

/**
 * Input Sanitization Middleware
 * Protects against NoSQL injection and XSS attacks
 */

// NoSQL Injection Prevention
const sanitizeMongoQuery = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`[SECURITY] Sanitized key "${key}" in request from IP: ${req.ip}`);
  }
});

// XSS Prevention - sanitize string inputs
const sanitizeXSS = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      // Remove potential script tags and dangerous HTML
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*on\w+\s*=/gi, '<')
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, 'data-blocked:')
        .trim();
    }
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.map(sanitizeValue);
      }
      const sanitized = {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);

  next();
};

// Validate Content-Type for POST/PUT/PATCH requests
const validateContentType = (req, res, next) => {
  const methods = ['POST', 'PUT', 'PATCH'];
  if (methods.includes(req.method) && req.headers['content-length'] > 0) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      // Allow multipart for file uploads
      if (!contentType || !contentType.includes('multipart/form-data')) {
        return res.status(415).json({ 
          error: 'Unsupported Media Type',
          message: 'Content-Type must be application/json'
        });
      }
    }
  }
  next();
};

// Request size limiter (backup to express.json limit)
const validateRequestSize = (maxSize = '10kb') => {
  const bytes = parseSize(maxSize);
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || 0);
    if (contentLength > bytes) {
      return res.status(413).json({
        error: 'Payload Too Large',
        message: `Request body exceeds ${maxSize} limit`
      });
    }
    next();
  };
};

function parseSize(size) {
  const units = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };
  const match = size.toLowerCase().match(/^(\d+)(b|kb|mb|gb)?$/);
  if (!match) return 10 * 1024; // default 10kb
  return parseInt(match[1]) * (units[match[2]] || 1);
}

module.exports = {
  sanitizeMongoQuery,
  sanitizeXSS,
  validateContentType,
  validateRequestSize
};
