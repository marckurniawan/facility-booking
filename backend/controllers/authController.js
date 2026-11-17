import { register } from '../services/authService.js';
import { AppError } from '../utils/AppError.js';
import { isMissing, validateEmail, validateString, validatePassword } from '../utils/validators.js';

export const registerUser = async (req, res, next) => {
    try {
        const allowedFields = ['username', 'email', 'password'];
        if (
            !req.body ||
            typeof req.body !== 'object' ||
            Array.isArray(req.body)
        ) {
            return next(new AppError('Request body must be a JSON object', 400));
        }
        const hasUnexpectedField = Object.keys(req.body).some(
            (field) => !allowedFields.includes(field)
        );

        if (hasUnexpectedField) {
            return next(new AppError('Unexpected request field', 400));
        }

        const { username, email, password } = req.body;

        if (isMissing(username)) {
            return next(new AppError('Username is required', 400));
        }

        if (isMissing(email)) {
            return next(new AppError('Email is required', 400));
        }

        if (isMissing(password)) {
            return next(new AppError('Password is required', 400));
        }

        const fields = [
            [username, 'Username'],
            [email, 'Email'],
            [password, 'Password'],
        ];

        for (const [value, fieldName] of fields) {
            const validation = validateString(value, fieldName);

            if (!validation.valid) {
                return next(new AppError(validation.message, 400));
            }
        }

        const emailValidation = validateEmail(email);

        if (!emailValidation.valid) {
            return next(new AppError(emailValidation.message, 400));
        }

        const passwordValidation = validatePassword(password);

        if (!passwordValidation.valid) {
            return next(new AppError(passwordValidation.message, 400));
        }


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