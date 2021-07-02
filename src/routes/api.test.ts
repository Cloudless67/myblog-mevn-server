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

afterAll(async done => {
    await DatabaseManager.instance.disconnect();
    server.close();
    done();
});

describe('GET /posts', () => {
    test('should respond with json:array', async done => {
        await request(app)
            .get('/api/posts/')
            .set('Accept', 'application/json')
            .expect(200)
            .then(res => {
                expect(res.body).toBeInstanceOf(Array);
                done();
            })
            .catch(done);
    });
});
