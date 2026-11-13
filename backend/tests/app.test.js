import request from 'supertest';
import app from '../app.js';


describe('404 Handler', () => {
    test('should return 404 when route does not exist', async () => {
        const response = await request(app)
            .get('/non-existent-route');

        expect(response.status).toBe(404);

        expect(response.headers['content-type']).toMatch(/json/);

        expect(response.body).toEqual({
            message: 'Not Found'
        });
    });
});