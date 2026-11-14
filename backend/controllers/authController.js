import { register } from '../services/authService.js';
import { AppError } from '../utils/AppError.js';

export const registerUser = async (req, res, next) => {
    try {
        const allowedFields = ['username', 'email', 'password'];

        const hasUnexpectedField = Object.keys(req.body).some(
            (field) => !allowedFields.includes(field)
        );

        if (hasUnexpectedField) {
            return next(new AppError('Unexpected request field', 400));
        }

        const { username, email, password } = req.body;

        const user = await register({
            username,
            email,
            password
        });

        return res.status(201).json(user);
    } catch (error) {
        return next(error);
    }
};