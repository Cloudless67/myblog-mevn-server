import { ICategory } from './category';
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
        const result = await Database.instance.saveObjToCollection(
            'Category',
            testCategory
        );
        expect((result as ICategory).name).toEqual(testCategory.name);
    });

    test('find from database should work', async () => {
        const data = (await Database.instance.findFromCollection(
            'Category',
            testCategory
        )) as any[];

        expect(data).toBeInstanceOf(Array);
        expect((data[0] as ICategory).name).toEqual(testCategory.name);
    });

    test('update to database should work', async () => {
        await Database.instance.updateObjAtCollection(
            'Category',
            testCategory,
            updatedCategory
        );
        const data = (await Database.instance.findFromCollection(
            'Category',
            updatedCategory
        )) as any[];

        expect(data).toBeInstanceOf(Array);
        expect((data[0] as ICategory).name).toEqual(updatedCategory.name);
    });

    test('delete should work', async () => {
        await Database.instance.deleteFromCollection(
            'Category',
            updatedCategory
        );
        const data = (await Database.instance.findFromCollection(
            'Category',
            updatedCategory
        )) as any[];

        expect(data).toBeInstanceOf(Array);
        expect(data.length).toBe(0);
    });

    afterAll(async () => {
        await Database.instance.dropDatabase();
        await Database.instance.disconnect();
    });
});
