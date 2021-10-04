import { Server } from 'node:http';
import request from 'supertest';
import app from '../app';
import DatabaseManager from '../models/database';

let server: Server;

beforeAll(done => {
    DatabaseManager.instance.connect('myblog').then(() => {
        server = app.listen(process.env.PORT || 3000, done);
    });
});

afterAll(async () => {
    await DatabaseManager.instance.disconnect();
    server.close();
});

describe('GET /posts', () => {
    test('should respond with json: array', async () => {
        const res = await request(app)
            .get('/api/posts/')
            .set('Accept', 'application/json')
            .expect(200);

        expect(res.body.posts).toBeInstanceOf(Array);
    });
});
