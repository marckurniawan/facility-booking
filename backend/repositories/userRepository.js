import pool from '../db.js';

export const insertUser = async ({ username, email, passwordHash }) => {
    const result = await pool.query(
        `INSERT INTO users (username, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, username, email, role`,
        [username, email, passwordHash]
    );

    return result.rows[0];
};
