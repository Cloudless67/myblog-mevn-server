import { Request, Response } from 'express';
import { ICategory } from '../models/category';
import DBManager from '../models/database';
import { Category, CategoryObject } from '../types';
import { isError } from '../types/isError';

async function getCategories(req: Request, res: Response) {
    try {
        const categories = await DBManager.instance.findAllCategories();
        res.json(categories.map(x => x.name));
    } catch (error) {
        if (isError(error)) res.status(500).send(error.message);
    }
}

async function getStructuredCategories(req: Request, res: Response) {
    try {
        const categories = await DBManager.instance.findAllCategories();
        res.json(structureCategories(categories.map(CategoryObjectFromICategory)));
    } catch (error) {
        if (isError(error)) res.status(500).send(error.message);
    }
}

async function postCategory(req: Request, res: Response) {
    const parent = req.body.parent;
    const newCategory = categoryFromReq(req);

    try {
        await createCategory(newCategory, parent);
        res.status(200).end();
    } catch (error) {
        if (isError(error)) res.status(409).send(error.message);
    }
}

async function putCategory(req: Request, res: Response) {
    const parent = req.body.parent;
    const name = req.params.name;

    try {
        await DBManager.instance.updateCategory({ children: name }, { $pull: { children: name } });
        if (parent) {
            await DBManager.instance.updateCategory(
                { name: parent },
                { $push: { children: name } }
            );
            await DBManager.instance.updateCategory({ name }, { isTopLevel: false });
        } else {
            await DBManager.instance.updateCategory({ name }, { isTopLevel: true });
        }
        const categories: CategoryObject[] = await DBManager.instance.findAllCategories();
        res.json(structureCategories(categories));
    } catch (error) {
        if (isError(error)) res.status(400).send(error.message);
    }
}

async function deleteCategory(req: Request, res: Response) {
    const name = req.params.name;
    try {
        await deleteCategoryFromDB(name);
        res.status(200).end();
    } catch (error) {
        if (isError(error)) res.status(400).send(error.message);
    }
}

async function deleteCategoryFromDB(name: string) {
    const category = await DBManager.instance.findOneCategory({ name });

    if (!category) throw new Error('The category does not exists.');
    if (category.children) throw new Error('Can not delete category with children.');

    await DBManager.instance.updateCategory({ children: name }, { $pull: { children: name } });
    DBManager.instance.deleteCategory({ name });
}

async function createCategory(category: CategoryObject, parent?: string) {
    await DBManager.instance.saveCategory(category);
    DBManager.instance.updateCategory({ name: parent }, { $push: { children: category.name } });
}

function structureCategories(categories: CategoryObject[]): Category[] {
    function appendChildren(category: CategoryObject) {
        if (category.children.length === 0) return category.name;

        category.children = category.children.map(child => {
            const childCategory = categories.find(c => c.name === child);
            if (childCategory) return appendChildren(childCategory);
            else throw new Error('Something wrong in category data');
        });
        return category;
    }

    return categories.filter(category => category.isTopLevel).map(appendChildren);
}

function CategoryObjectFromICategory(icat: ICategory): CategoryObject {
    return {
        name: icat.name,
        isTopLevel: icat.isTopLevel,
        children: icat.children,
    };
}

function categoryFromReq(req: Request): CategoryObject {
    return {
        name: req.body.name,
        isTopLevel: req.body.parent === undefined,
        children: [],
    };
}

export {
    getCategories,
    getStructuredCategories,
    postCategory,
    putCategory,
    deleteCategory,
    structureCategories,
};
