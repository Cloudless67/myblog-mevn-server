import Database from './database';

const testCategory = { name: 'test' };
const updatedCategory = { name: 'update test' };

describe('CRUD Operation to database', () => {
    beforeAll(async () => {
        await Database.instance.connect('test');
    });

    test('singleton instance is well created', () => {
        expect(Database.instance).toBeInstanceOf(Database);
    });

    test('save to database should work', async () => {
        const result = (await Database.instance.saveCategory(testCategory)) as any;
        expect(result).not.toBeInstanceOf(Error);
        expect(result.name).toEqual(testCategory.name);
    });

    test('find from database should work', async () => {
        const category = (await Database.instance.findOneCategory(testCategory)) as any;

        expect(category).not.toBeInstanceOf(Error);
        expect(category.name).toEqual(testCategory.name);
    });

    test('update to database should work', async () => {
        await Database.instance.updateCategory(testCategory, updatedCategory);
        const category = (await Database.instance.findOneCategory(updatedCategory)) as any;

        expect(category).not.toBeInstanceOf(Error);
        expect(category.name).toEqual(updatedCategory.name);
    });

    test('delete should work', async () => {
        await Database.instance.deleteCategory(updatedCategory);
        const category = (await Database.instance.findOneCategory(updatedCategory)) as any;

        expect(category).toBeUndefined();
    });

    afterAll(async () => {
        await Database.instance.dropDatabase();
        await Database.instance.disconnect();
    });
});
