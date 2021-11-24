import { verifyPassword } from './Authentication';

const RAW_PASSWORD = process.env.RAW_PASSWORD || '';

describe('Authentication', () => {
    it('should return 200 OK for correct password', async () => {
        const { status } = await verifyPassword(RAW_PASSWORD);
        expect(status).toBe(200);
    });

    it('should return 403 for wrong password', async () => {
        const { status, payload } = await verifyPassword('Wrong password');
        expect(status).toBe(403);
        expect(payload).toBe('Wrong password');
    });
});
