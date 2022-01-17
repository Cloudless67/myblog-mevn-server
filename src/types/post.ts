type Thumbnail = {
    url: string;
    aspectRatio: number;
};

type PostRaw = {
    title: string;
    url: string;
    thumbnail?: Thumbnail;
    body: string;
    writtenTime: string;
    views: number;
    repliesNum: number;
};

type PostPreview = Omit<PostRaw, 'thumbnail' | 'body'> | { preview: string };

type PutPostData = {
    category: string;
    title: string;
    thumbnail?: Thumbnail;
    body: string;
    tags: string;
};

export { Thumbnail, PostRaw, PostPreview, PutPostData };
