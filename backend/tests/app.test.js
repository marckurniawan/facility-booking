import request from 'supertest';
import app from '../app.js';

describe('App', () => {
    test('returns 404 for an unknown path', async () => {
        const response = await request(app)
            .get('/this-path-does-not-exist');

        expect(response.status).toBe(404);
    });
});