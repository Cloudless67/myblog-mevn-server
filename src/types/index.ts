export type CategoryObject = {
    name: string;
    isTopLevel: boolean;
    children: Array<Category>;
};

export type Category = CategoryObject | string;
