// Custom error classes for structured error handling

// Error hierarchy:
// AppError (E1009, 500) - Base class
// ValidationError (E1008, 400) - Invalid input
// DatabaseError (E1005, 500) - MongoDB failures
// ExternalAPIError (E1006, 502) - 3rd-party API failures
// CircuitBreakerError (E1007, 503) - Circuit breaker open

export class AppError extends Error {
    constructor(message, code = 'E1009', httpStatus = 500, details = null) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.httpStatus = httpStatus;
        this.details = details;
        this.isOperational = true;
    }
}

export class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, 'E1008', 400, details);
        this.name = 'ValidationError';
    }
}

export class DatabaseError extends AppError {
    constructor(message, details = null) {
        super(message, 'E1005', 500, details);
        this.name = 'DatabaseError';
    }
}

export class ExternalAPIError extends AppError {
    constructor(message, service = 'unknown', details = null) {
        super(message, 'E1006', 502, details);
        this.name = 'ExternalAPIError';
        this.service = service;
    }
}

export class CircuitBreakerError extends AppError {
    constructor(service) {
        super(`Circuit breaker is open for ${service}`, 'E1007', 503);
        this.name = 'CircuitBreakerError';
        this.service = service;
    }
}

export default { AppError, ValidationError, DatabaseError, ExternalAPIError, CircuitBreakerError };
