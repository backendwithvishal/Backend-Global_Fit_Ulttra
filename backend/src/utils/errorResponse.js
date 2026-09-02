// Standardized error response utility

export const errorResponse = (res, error) => {
    const statusCode = error.httpStatus || error.statusCode || 500;
    const response = {
        success: false,
        error: {
            code: error.code || 'INTERNAL_ERROR',
            message: error.isOperational ? error.message : 'An unexpected error occurred',
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
        },
        timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
};

export default errorResponse;
