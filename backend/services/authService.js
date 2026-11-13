import bcrypt from 'bcrypt';
import { insertUser } from '../repositories/userRepository.js';

const SALT_ROUNDS = 10;

export const register = async ({ username, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    return insertUser({username, email: normalizedEmail, passwordHash});
};