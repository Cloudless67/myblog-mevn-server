import { NextFunction, Request, Response } from 'express';
import DBManager from '../models/database';

export default class CategoryController {
    public static async getCategories(req: Request, res: Response, next: NextFunction) {
        const categories = (await DBManager.instance.findFromCollection('Category', {})) as any[];
        const structured = CategoryController.structureCategories(categories);

        res.status(200).json(structured);
        next();
    }

    public static async postCategory(req: Request, res: Response, next: NextFunction) {
        const parent: string | undefined = req.body.parent;
        const newCategory: CategoryObject = CategoryController.categoryFromReq(req);
        await CategoryController.createCategory(newCategory, parent);

        res.status(200).end();
        next();
    }

    public static async putCategory(req: Request, res: Response, next: NextFunction) {
        const oldCategoryName: string = req.params.name;
        const parent: string | undefined = req.body.parent;
        console.log(req.params.name);
        await CategoryController.deleteCategoryFromDb(oldCategoryName);

        const newCategory: CategoryObject = CategoryController.categoryFromReq(req);
        await CategoryController.createCategory(newCategory, parent);

        res.status(200).end();
        next();
    }

    private static categoryFromReq(req: Request): CategoryObject {
        return {
            name: req.body.name,
            isTopLevel: req.body.parent === undefined,
            children: [],
        };
    }

    public static async deleteCategory(req: Request, res: Response, next: NextFunction) {
        const name: string = req.params.name;
        await CategoryController.deleteCategoryFromDb(name);

        res.status(200).end();
        next();
    }

    private static async deleteCategoryFromDb(name: string) {
        await DBManager.instance.updateObjAtCollection(
            'Category',
            { children: name },
            { $pull: { children: name } }
        );
        await DBManager.instance.deleteFromCollection('Category', { name });
    }

    private static async createCategory(category: CategoryObject, parent: string | undefined) {
        await DBManager.instance.saveObjToCollection('Category', category);
        await DBManager.instance.updateObjAtCollection(
            'Category',
            { name: parent },
            { $push: { children: category.name } }
        );
    }

    public static structureCategories(categories: CategoryObject[]): Category[] {
        const clone = CategoryController.deepCloneCategories(categories);
        const structured: Category[] = [];

        clone
            .filter(x => x.isTopLevel)
            .forEach(top => structured.push(CategoryController.appendChildren(top, clone)));
        return structured;
    }

    public static appendChildren(category: CategoryObject, clone: CategoryObject[]) {
        category.children = category.children.map(CategoryController.strToObject(clone));
        return category.children.length > 0 ? category : category.name;
    }

    private static strToObject(clone: CategoryObject[]) {
        return (child: Category) => {
            if (typeof child === 'string') {
                let newChild = clone.find(x => x.name === child) as CategoryObject;
                if (newChild.children.length > 0) {
                    CategoryController.appendChildren(newChild, clone);
                    return newChild;
                }
            }
            return child;
        };
    }

    private static deepCloneCategories(categories: CategoryObject[]): CategoryObject[] {
        return categories.map(category => ({
            name: category.name,
            isTopLevel: category.isTopLevel,
            children: [...category.children],
        }));
    }
}

type CategoryObject = {
    name: string;
    isTopLevel: boolean;
    children: Array<Category>;
};

type Category = CategoryObject | string;
