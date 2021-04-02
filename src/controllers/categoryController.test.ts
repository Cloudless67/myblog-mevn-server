import CategoryController from './categoryController';

test('should build category object correctly', () => {
    const categories = [
        {
            name: 'Frontend',
            isTopLevel: true,
            children: ['Angular', 'React', 'Vue'],
        },
        {
            name: 'Backend',
            isTopLevel: true,
            children: ['Express', 'Spring'],
        },
        {
            name: 'Angular',
            isTopLevel: false,
            children: [],
        },
        {
            name: 'React',
            isTopLevel: false,
            children: [],
        },
        {
            name: 'Vue',
            isTopLevel: false,
            children: ['Nuxt'],
        },
        {
            name: 'Express',
            isTopLevel: false,
            children: [],
        },
        {
            name: 'Spring',
            isTopLevel: false,
            children: [],
        },
        {
            name: 'Nuxt',
            isTopLevel: false,
            children: [],
        },
    ];
    const expected = [
        {
            name: 'Frontend',
            isTopLevel: true,
            children: [
                'Angular',
                'React',
                {
                    name: 'Vue',
                    isTopLevel: false,
                    children: ['Nuxt'],
                },
            ],
        },
        {
            name: 'Backend',
            isTopLevel: true,
            children: ['Express', 'Spring'],
        },
    ];

    const structured = CategoryController.structureCategories(categories);
    expect(structured).toEqual(expected);
});
