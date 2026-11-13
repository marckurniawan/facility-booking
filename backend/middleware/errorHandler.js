import { AppError } from '../utils/AppError.js';

export const errorHandlerMiddleware = (err, req, res, next) => {
    console.error(err);

    if (err instanceof AppError) {
        return res.status(err.status).json({
            message: err.message
        });
    }

    return res.status(500).json({
        message: 'Internal server error'
    });
};