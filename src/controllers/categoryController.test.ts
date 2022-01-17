import fs from 'fs';
import * as CategoryController from './categoryController';

const CATEGORY_OBJECT_PATH = 'src/mocks/categoryControllerTest/categoryObject.json';
const STRUCTURED_CATEGORY_PATH = 'src/mocks/categoryControllerTest/structuredObject.json';

describe('Category controller tests', () => {
    test.only('should build category object correctly', () => {
        const categories = JSON.parse(fs.readFileSync(CATEGORY_OBJECT_PATH, 'utf8'));
        const expected = JSON.parse(fs.readFileSync(STRUCTURED_CATEGORY_PATH, 'utf8'));
        const structured = CategoryController.structureCategories(categories);
        expect(structured).toEqual(expected);
    });
});
