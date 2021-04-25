import { Request, Response } from 'express';
import DBManager from '../models/database';

export async function getCategories(req: Request, res: Response) {
    try {
        const categories = await DBManager.instance.findAllCategories();
        if (categories) res.json(categories.map((x: any) => x.name));
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export async function getStructuredCategories(req: Request, res: Response) {
    try {
        const categories = await DBManager.instance.findAllCategories();
        res.json(structureCategories(categories as any[]));
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export async function postCategory(req: Request, res: Response) {
    const parent: string | undefined = req.body.parent;
    const newCategory = categoryFromReq(req);

    try {
        await createCategory(newCategory, parent);
        res.status(200).end();
    } catch (error) {
        res.status(409).send(error.message);
    }
}

export async function putCategory(req: Request, res: Response) {
    const parent = req.body.parent;
    const name = req.params.name;

    try {
        await DBManager.instance.updateCategory({ children: name }, { $pull: { children: name } });
        if (parent) {
            const x = await DBManager.instance.updateCategory(
                { name: parent },
                { $push: { children: name } }
            );
            await DBManager.instance.updateCategory({ name }, { isTopLevel: false });
        } else {
            await DBManager.instance.updateCategory({ name }, { isTopLevel: true });
        }
        const categories = await DBManager.instance.findAllCategories();
        res.json(structureCategories(categories as any[]));
    } catch (error) {
        res.status(400).send(error.message);
        return;
    }
}

export async function deleteCategory(req: Request, res: Response) {
    const name: string = req.params.name;
    try {
        await deleteCategoryFromDB(name);
        res.status(200).end();
    } catch (error) {
        res.status(400).send(error.message);
    }
}

async function deleteCategoryFromDB(name: string) {
    const category = (await DBManager.instance.findOneCategory({ name })) as any;
    if (!category) throw new Error('The category does not exists.');
    if (category.children) throw new Error('Can not delete category with children.');
    await DBManager.instance.updateCategory({ children: name }, { $pull: { children: name } });
    await DBManager.instance.deleteCategory({ name });
}

async function createCategory(category: CategoryObject, parent: string | undefined) {
    await DBManager.instance.saveCategory(category);
    await DBManager.instance.updateCategory(
        { name: parent },
        { $push: { children: category.name } }
    );
}

export function structureCategories(categories: CategoryObject[]): Category[] {
    const clone = deepCloneCategories(categories);
    const structured: Category[] = [];

    clone.filter(x => x.isTopLevel).forEach(top => structured.push(appendChildren(top, clone)));
    return structured;
}

function categoryFromReq(req: Request): CategoryObject {
    return {
        name: req.body.name,
        isTopLevel: req.body.parent === undefined,
        children: [],
    };
}

function appendChildren(category: CategoryObject, clone: CategoryObject[]) {
    category.children = category.children.map(strToObject(clone));
    return category.children.length > 0 ? category : category.name;
}

function strToObject(clone: CategoryObject[]) {
    return (child: Category) => {
        if (typeof child === 'string') {
            let newChild = clone.find(x => x.name === child) as CategoryObject;
            if (newChild.children.length > 0) {
                appendChildren(newChild, clone);
                return newChild;
            }
        }
        return child;
    };
}

function deepCloneCategories(categories: CategoryObject[]): CategoryObject[] {
    return categories.map(category => ({
        name: category.name,
        isTopLevel: category.isTopLevel,
        children: [...category.children],
    }));
}

type CategoryObject = {
    name: string;
    isTopLevel: boolean;
    children: Array<Category>;
};

type Category = CategoryObject | string;
