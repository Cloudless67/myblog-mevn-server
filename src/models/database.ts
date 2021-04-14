import { connect, connection, disconnect, Document, Model } from 'mongoose';
import CategorySchema, { ICategory } from './category';
import PostSchema, { IPost } from './post';

type ValidSubdomains = 'www' | 'ee';
type Collections = 'Category' | 'Post';

const connectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    bufferCommands: false,
};

export default class DatabaseManager {
    private static _instance: DatabaseManager | undefined;

    private Category!: Model<ICategory>;
    private Post!: Model<IPost>;

    public static get instance() {
        if (!this._instance) {
            this._instance = new DatabaseManager();
        }
        return this._instance;
    }

    public async connect(url?: string): Promise<void> {
        const uri = process.env.DB_URL! + (url || process.env.DB_DEFAULT!);
        connect(uri, connectOptions);

        console.log('Successfully connected to mongodb!');

        connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

        this.updateModels();
    }

    public async disconnect(): Promise<void> {
        try {
            await disconnect();
        } catch (error) {
            console.error(error);
        }
    }

    public changeDatabase(dbName: ValidSubdomains): void {
        connection.useDb(dbName, { useCache: true });
        this.updateModels();
    }

    public async saveCategory(category: object): Promise<Document | void> {
        return await this.trySaveDocToDb(new this.Category(category));
    }

    public async savePost(post: object): Promise<Document | void> {
        return await this.trySaveDocToDb(new this.Post(post));
    }

    public async findOneCategory(where: object): Promise<Document | void> {
        const doc = await this.findCategories(where);
        return doc instanceof Array ? doc[0] : doc;
    }

    public async findAllCategories(): Promise<Document[] | void> {
        return await this.Category.find({}).catch(this.throwError);
    }

    public async findAllPosts(): Promise<Document[] | void> {
        return await this.findPosts({});
    }

    public async findPostsInCategory(category: string): Promise<Document[] | void> {
        return await this.findPosts({ category });
    }

    public async findPostsWithTag(tag: string): Promise<Document[] | void> {
        return await this.findPosts({ tags: tag });
    }

    public async findOnePost(where: object): Promise<Document | void> {
        const doc = await this.findPosts(where);
        return doc instanceof Array ? doc[0] : doc;
    }

    private async findPosts(where: object): Promise<Document[] | void> {
        return await this.Post.find(where).catch(this.throwError);
    }

    private async findCategories(where: object): Promise<Document[] | void> {
        return await this.Category.find(where).catch(this.throwError);
    }

    public async updateCategory(where: object, query: object): Promise<{} | void> {
        return await this.Category.updateOne(where, query).catch(this.throwError);
    }

    public async updatePost(where: object, query: object): Promise<{} | void> {
        return await this.Post.updateOne(where, query).catch(this.throwError);
    }

    public async deleteCategory(where: object): Promise<{} | void> {
        return await this.Category.deleteOne(where).catch(this.throwError);
    }

    public async deletePost(condition: object): Promise<{} | void> {
        return await this.Post.deleteOne(condition).catch(this.throwError);
    }

    private async trySaveDocToDb(document: Document): Promise<Document | void> {
        return await document.save().catch(this.throwError);
    }

    private constructor() {}

    private updateModels(): void {
        this.Category = connection.model<ICategory>('Category', CategorySchema);
        this.Post = connection.model<IPost>('Post', PostSchema);
    }

    public async dropDatabase() {
        await connection.dropDatabase();
    }

    private throwError(e: any): void {
        throw e;
    }
}
