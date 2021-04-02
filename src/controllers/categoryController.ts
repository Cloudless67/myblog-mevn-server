import { NextFunction, Request, Response } from 'express';
import DBManager from '../models/database';

export default class CategoryController {
    public static async getCategories(req: Request, res: Response, next: NextFunction) {
        const categories = (await DBManager.instance.findFromCollection('Category', {})) as any[];
        res.status(200).json(CategoryController.structureCategories(categories));
        next();
    }

    public static async postCategory(req: Request, res: Response, next: NextFunction) {
        const parent: string | undefined = req.body.parent;
        const newCategory: Category = CategoryController.categoryFromReq(req);
        await CategoryController.createCategory(newCategory, parent);

        res.status(200).end();
        next();
    }

    public static async putCategory(req: Request, res: Response, next: NextFunction) {
        const oldCategoryName: string = req.params.name;
        const parent: string | undefined = req.body.parent;
        console.log(req.params.name);
        await CategoryController.deleteCategoryFromDb(oldCategoryName);

        const newCategory: Category = CategoryController.categoryFromReq(req);
        await CategoryController.createCategory(newCategory, parent);

        res.status(200).end();
        next();
    }

    private static categoryFromReq(req: Request): Category {
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

    private static async createCategory(category: Category, parent: string | undefined) {
        await DBManager.instance.saveObjToCollection('Category', category);
        await DBManager.instance.updateObjAtCollection(
            'Category',
            { name: parent },
            { $push: { children: category.name } }
        );
    }

    public static structureCategories(categories: Category[]): Category[] {
        const structured: Category[] = [];

        categories.filter(x => x.isTopLevel).forEach(top => structured.push(top));
        structured.forEach(category => CategoryController.appendChildren(category, categories));
        return structured;
    }

    public static appendChildren(category: Category, categories: Category[]) {
        category.children = category.children.map(CategoryController.strToObject(categories));
    }

    private static strToObject(categories: Category[]) {
        return (child: string | Category) => {
            if (typeof child === 'string') {
                let newChild = categories.find(x => x.name === child) as Category;
                if (newChild.children.length > 0) {
                    CategoryController.appendChildren(newChild, categories);
                    return newChild;
                }
            }
            return child;
        };
    }
}

type Category = {
    name: string;
    isTopLevel: boolean;
    children: Array<string | Category>;
};
