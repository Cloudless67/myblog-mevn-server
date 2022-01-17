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

export { Thumbnail, PostRaw, PostPreview };
