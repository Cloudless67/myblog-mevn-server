import { NextFunction, Request, Response } from 'express';
import DBManager from '../models/database';

type Next = NextFunction;

export default class CategoryController {
    public static async getCategories(req: Request, res: Response, next: Next) {
        try {
            const categories = await DBManager.instance.findAllCategories();
            res.json(CategoryController.structureCategories(categories as any[]));
        } catch (error) {
            res.status(500).send(error.message);
        }
        next();
    }

    public static async postCategory(req: Request, res: Response, next: Next) {
        const parent: string | undefined = req.body.parent;
        const newCategory = CategoryController.categoryFromReq(req);

        await CategoryController.tryCreateCategory(newCategory, res, parent);
        next();
    }

    public static async putCategory(req: Request, res: Response, next: Next) {
        const parent: string | undefined = req.body.parent;
        await CategoryController.tryDeleteCategory(req.params.name, res);

        const newCategory: CategoryObject = CategoryController.categoryFromReq(req);
        await CategoryController.tryCreateCategory(newCategory, res, parent);
        next();
    }

    public static async deleteCategory(req: Request, res: Response, next: Next) {
        const name: string = req.params.name;
        await CategoryController.deleteCategoryFromDB(name);

        res.status(200).end();
        next();
    }

    private static async deleteCategoryFromDB(name: string) {
        const category = (await DBManager.instance.findOneCategory({ name })) as any;
        if (!category) throw new Error('The category does not exists.');
        if (category.children) throw new Error('Can not delete category with children.');
        await DBManager.instance.updateCategory({ children: name }, { $pull: { children: name } });
        await DBManager.instance.deleteCategory({ name });
    }

    private static async createCategory(category: CategoryObject, parent: string | undefined) {
        await DBManager.instance.saveCategory(category);
        await DBManager.instance.updateCategory(
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

    private static async tryCreateCategory(
        category: CategoryObject,
        res: Response,
        parent?: string
    ) {
        try {
            await CategoryController.createCategory(category, parent);
            res.status(200).end();
        } catch (error) {
            res.status(409).send(error.message);
        }
    }

    private static async tryDeleteCategory(oldCategoryName: string, res: Response) {
        try {
            await CategoryController.deleteCategoryFromDB(oldCategoryName);
        } catch (error) {
            res.status(404).send(error.message);
        }
    }

    private static categoryFromReq(req: Request): CategoryObject {
        return {
            name: req.body.name,
            isTopLevel: req.body.parent === undefined,
            children: [],
        };
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
