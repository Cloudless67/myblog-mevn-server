import { verifyPassword } from './Authentication';

describe('Authentication', () => {
    it('should return 403 for wrong password', async () => {
        const { status, payload } = await verifyPassword('Wrong password');
        expect(status).toBe(403);
        expect(payload).toBe('Wrong password');
    });
});
