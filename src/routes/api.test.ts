import { Server } from 'node:http';
import request from 'supertest';
import app from '../app';
import DatabaseManager from '../models/database';

let server: Server;

beforeAll(async done => {
    await DatabaseManager.instance.connect('test_rest');
    server = app.listen(process.env.PORT || 3000, done);
});

afterAll(async done => {
    await DatabaseManager.instance.dropDatabase();
    await DatabaseManager.instance.disconnect();
    server.close();
    done();
});

describe('GET /posts', () => {
    test('should respond with json:array', async done => {
        const res = await request(app)
            .get('/api/posts')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .catch(done);

        expect(res.body).toBeInstanceOf(Array);
        done();
    });
});

// describe('GET /post', () => {
//     test('should respond with json', async done => {
//         const res = await request(app).get('/api/post/')
//     });
// });
