import request from 'supertest';
import app from '../app.js';
import pool from '../db.js'; 
import bcrypt from 'bcrypt';
import { response } from 'express';


beforeEach(async () => {
    await pool.query(
        'TRUNCATE users, facilities, bookings RESTART IDENTITY CASCADE'
    );
});

describe('POST /register', () => {
  
    test('returns 201 and safe user data when registration succeeds', async () => {
        const response = await request(app)
            .post('/register')
            .send({
            username: 'marcell_test',
            email: 'marcell_test@example.com',
            password: 'StrongPassword123!',
            });

        expect(response.status).toBe(201);

        expect(response.body).toEqual({
            id: expect.any(Number),
            username: 'marcell_test',
            email: 'marcell_test@example.com',
            role: 'user',
        });

        expect(response.body).not.toHaveProperty('password');
        expect(response.body).not.toHaveProperty('password_hash');
    });

    test('stores the password as a bcrypt hash', async () => {
        const password = 'StrongPassword123!';

        await request(app)
            .post('/register')
            .send({
                username: 'marcell_hash_test',
                email: 'marcell_hash_test@example.com',
                password,
            })
            .expect(201);

        const result = await pool.query(
            'SELECT password_hash FROM users WHERE email = $1',
            ['marcell_hash_test@example.com']
        );

        expect(result.rows).toHaveLength(1);

        const storedHash = result.rows[0].password_hash;

        expect(storedHash).not.toBe(password);


        const isPasswordValid = await bcrypt.compare(
            password,
            storedHash
        );

        expect(isPasswordValid).toBe(true);
    });

    test('trims and lowercases the email', async () => {
        const email = ' marcell_teSt@test.com  ';
        const expectedEmail = 'marcell_test@test.com';
        const response = await request(app)
            .post('/register')
            .send({
                username: 'marcell_test',
                email,
                password: 'StrongPassword123!'
            })
        expect(response.status).toBe(201);

        const result = await pool.query(`SELECT email FROM users 
                                         WHERE username  = $1`, ['marcell_test']);
        
        
        expect(result.rows).toHaveLength(1);
        expect(result.rows[0].email).toBe(expectedEmail);
    });

    test('rejects an email that differs only by letter case with 409', async () => {
        const response1 = await request(app)
            .post('/register')
            .send({
                username: 'marcell_test',
                email:'marcell_test@test.com',
                password: 'StrongPassword123!'
            });
        expect(response1.status).toBe(201);

        const response2 = await request(app)
            .post('/register')
            .send({
                username: 'marcell2_test',
                email:'marcelL_Test@test.com',
                password: 'StrongPassword123!'
            });
        expect(response2.status).toBe(409);
        expect(response2.body).toEqual({
            message: 'Email already in use'
        });
            
        
    });

    test('rejects a username that differs only by letter case with 409', async () => {
        const response1 = await request(app)
            .post('/register')
            .send({
                username: 'marcell_test',
                email:'marcell_test@test.com',
                password: 'StrongPassword123!'
            });
        expect(response1.status).toBe(201);

        const response2 = await request(app)
            .post('/register')
            .send({
                username: 'maRceLL_test',
                email:'marcell_test2@test.com',
                password: 'StrongPassword123!'
            });
        expect(response2.status).toBe(409)
        expect(response2.body).toEqual({
            message: 'Username already in use'
        });            
        
    });

    test('rejects role in the request body with 400', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                username: 'marcell_test',
                email: 'marcell_test@test.com',
                password: 'StrongPassword123!',
                role: 'admin'
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            message: 'Unexpected request field'
        });

        const result = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            ['marcell_test@test.com']
        );

        expect(result.rows).toHaveLength(0);
    });

    test.each([
        {
            missing: 'username',
            message: 'Username is required',
            body: {
                email: 'test@example.com',
                password: 'Password123!',
            },
        },
        {
            missing: 'email',
            message: 'Email is required',
            body: {
                username: 'testuser',
                password: 'Password123!',
            },
        },
        {
            missing: 'password',
            message: 'Password is required',
            body: {
                username: 'testuser',
                email: 'test@example.com',
            },
        },
    ])('should reject registration when $missing is missing', async ({ message, body }) => {
        const response = await request(app)
            .post('/register')
            .send(body);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(message);
        
        const result = await pool.query('SELECT id FROM users');
        expect(result.rows).toHaveLength(0);
    });

    test.each([
        ['without body', undefined],
        ['array body', []]
    ])('rejects %s', async (description, body) => {
        let req = request(app).post('/register');

        if (body !== undefined) {
            req = req.send(body);
        }

        const response = await req;

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
            'Request body must be a JSON object'
        );

        const result = await pool.query(
            'SELECT id FROM users'
        );

        expect(result.rows).toHaveLength(0);
    });
    
    test.each([
        {
            invalid: 'username',
            message: 'Username must be a string',
            body: {
                username: 123,
                email: 'test@example.com',
                password: 'Password123!',
            },
        },
        {
            invalid: 'email',
            message: 'Email must be a string',
            body: {
                username: 'testuser',
                email: 123,
                password: 'Password123!',
            },
        },
        {
            invalid: 'password',
            message: 'Password must be a string',
            body: {
                username: 'testuser',
                email: 'test@example.com',
                password: 123,
            },
        },
        {
            invalid: 'username object',
            message: 'Username must be a string',
            body: {
                username: { a: 1 },
                email: 'test@example.com',
                password: 'Password123!',
            },
        },
        {
            invalid: 'username array',
            message: 'Username must be a string',
            body: {
                username: ['x'],
                email: 'test@example.com',
                password: 'Password123!',
            },
        },
    ])('rejects fields with invalid $invalid with 400', async ({message, body}) => {
        const response = await request(app)
            .post('/register')
            .send(body);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(message);
        
        const result = await pool.query('SELECT id FROM users');
        expect(result.rows).toHaveLength(0);
    });

    
    test.each([
        {
            boundary: 'one below minimum',
            password: 'a'.repeat(7),
            expectedStatus: 400,
            expectedMessage: 'Password must be at least 8 characters',
        },
        {
            boundary: 'minimum exactly',
            password: 'a'.repeat(8),
            expectedStatus: 201,
        },
        {
            boundary: 'maximum exactly',
            password: 'a'.repeat(72),
            expectedStatus: 201,
        },
        {
            boundary: 'one byte above maximum',
            password: 'a'.repeat(73),
            expectedStatus: 400,
            expectedMessage: 'Password must not exceed 72 bytes',
        },
        {
            boundary: 'emoji exceeding maximum bytes',
            password: '😀'.repeat(19),
            expectedStatus: 400,
            expectedMessage: 'Password must not exceed 72 bytes',
        },
        {
            boundary: 'four emoji below minimum',
            password: '😀'.repeat(4),
            expectedStatus: 400,
            expectedMessage: 'Password must be at least 8 characters',
        },
    ])('validates password at $boundary', async ({
        password,
        expectedStatus,
        expectedMessage,
    }) => {
        const response = await request(app)
            .post('/register')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password,
            });

        expect(response.status).toBe(expectedStatus);

        if (expectedStatus === 400) {
            expect(response.body.message).toBe(expectedMessage);

            const result = await pool.query('SELECT id FROM users');
            expect(result.rows).toHaveLength(0);
        }
    });

    test.todo('allows only one of two concurrent registrations with the same email');

    test(
    'preserves the original casing of the username',
    async () => {
        const response = await request(app)
            .post('/register')
            .send({
                username: 'usnTeSt88',
                email: 'EmailTESting@tesT.Com',
                password: 'ValidPassword33!'
        })
        expect(response.status).toBe(201);

        const createdUser = response.body;
        
        expect(createdUser.username).toBe('usnTeSt88')

        const result = await pool.query(
            'SELECT username FROM users WHERE id = $1', 
            [createdUser.id]
        )

        expect(result.rows).toHaveLength(1);
        expect(result.rows[0].username).toBe('usnTeSt88');
    });  
    


});

afterAll(async () => {
    await pool.end();
});