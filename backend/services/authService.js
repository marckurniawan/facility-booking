import bcrypt from 'bcrypt';
import { insertUser } from '../repositories/userRepository.js';
import { AppError } from '../utils/AppError.js';


const SALT_ROUNDS = 10;
const EMAIL_UNIQUE_CONSTRAINT = 'users_email_lower_unique';
const USERNAME_UNIQUE_CONSTRAINT = 'users_username_lower_unique';

export const register = async ({ username, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const userData = {
        username,
        email: normalizedEmail,
        passwordHash
    };
    try {
        const user = await insertUser(userData);

        return user;
    } catch (err) {
        if (err.code !== '23505') {
            throw err;
        }

        if (err.constraint === EMAIL_UNIQUE_CONSTRAINT) {
            throw new AppError(409, 'email already in use');
        }

        if (err.constraint === USERNAME_UNIQUE_CONSTRAINT) {
            throw new AppError(409, 'username already in use');
        }

        throw err;
    }
};