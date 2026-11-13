import request from 'supertest';
import app from '../app.js';
import pool from '../db.js'; 
import bcrypt from 'bcrypt';


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
            message: 'email already in use'
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
            message: 'username already in use'
        });            
        
    });

    test.todo('rejects role in the request body with 400');

    test.todo('rejects missing required fields with 400');

    test.todo('rejects fields with invalid types with 400');

    test.todo('rejects passwords shorter than the minimum length');

    test.todo('rejects passwords longer than 72 bytes');

    test.todo('allows only one of two concurrent registrations with the same email');

    test.todo(
    'preserves username casing in the response while trimming and lowercasing email'
    );  
});

afterAll(async () => {
    await pool.end();
});