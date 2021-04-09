import { connect, connection, disconnect, Document, Model, Query } from 'mongoose';
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
        await connect(uri, connectOptions).catch(console.error);

        console.log('Successfully connected to mongodb!');

        connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

        this.updateModels();
    }

    public async disconnect(): Promise<void> {
        await disconnect().catch(console.error);
    }

    public changeDatabase(dbName: ValidSubdomains): void {
        connection.useDb(dbName, { useCache: true });
        this.updateModels();
    }

    public async saveCategory(category: object): Promise<Document | Error> {
        return await this.trySaveDocToDb(new this.Category(category));
    }

    public async savePost(post: object): Promise<Document | Error> {
        return await this.trySaveDocToDb(new this.Post(post));
    }

    public async findOneCategory(where: object): Promise<Document | Error> {
        const doc = await this.findCategories(where);
        return doc instanceof Error ? doc : doc[0];
    }

    public async findAllCategories(): Promise<Document[] | Error> {
        return await this.Category.find({}).catch(this.returnError);
    }

    public async findAllPosts(): Promise<Document[] | Error> {
        return await this.findPosts({});
    }

    public async findPostsInCategory(category: string): Promise<Document[] | Error> {
        return await this.findPosts({ category });
    }

    public async findOnePost(where: object): Promise<Document | Error> {
        const doc = await this.findPosts(where);
        return doc instanceof Error ? doc : doc[0];
    }

    private async findPosts(where: object): Promise<Document[] | Error> {
        return await this.Post.find(where).catch(this.returnError);
    }

    private async findCategories(where: object): Promise<Document[] | Error> {
        return await this.Category.find(where).catch(this.returnError);
    }

    public async updateCategory(where: object, query: object): Promise<{} | Error> {
        return await this.Category.updateOne(where, query).catch(this.returnError);
    }

    public async updatePost(where: object, query: object): Promise<{} | Error> {
        return await this.Post.updateOne(where, query).catch(this.returnError);
    }

    public async deleteCategory(where: object): Promise<{} | Error> {
        return await this.Category.deleteOne(where).catch(this.returnError);
    }

    public async deletePost(condition: object): Promise<{} | Error> {
        return await this.Post.deleteOne(condition).catch(this.returnError);
    }

    private async trySaveDocToDb(document: Document): Promise<Document | Error> {
        return await document.save().catch(this.returnError);
    }

    private constructor() {}

    private updateModels(): void {
        this.Category = connection.model<ICategory>('Category', CategorySchema);
        this.Post = connection.model<IPost>('Post', PostSchema);
    }

    public async dropDatabase() {
        await connection.dropDatabase();
    }

    private returnError(e: any): Error {
        console.log(e);
        return e;
    }
}
