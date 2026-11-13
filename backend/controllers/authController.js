import { register } from '../services/authService.js';

export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    const user = await register({ username, email, password });

    return res.status(201).json(user);
};