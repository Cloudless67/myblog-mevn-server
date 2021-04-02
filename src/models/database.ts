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

    public async saveObjToCollection(
        collection: Collections,
        document: object
    ): Promise<Document | void> {
        const documentOfCollection = new this[collection](document);
        return await this.trySaveDocToDb(documentOfCollection);
    }

    public async findFromCollection(
        collection: Collections,
        filter: object
    ): Promise<Document[] | void> {
        return await (this[collection] as Model<any>).find(filter).catch(console.error);
    }

    public async findOneFromCollection(collection: Collections, filter: object): Promise<Document> {
        return ((await this.findFromCollection(collection, filter)) as Document[])[0];
    }

    public async updateObjAtCollection(
        collection: Collections,
        filter: object,
        query: object
    ): Promise<void> {
        await this[collection].updateOne(filter, query).catch(console.error);
    }

    public async deleteFromCollection(collection: Collections, condition: object): Promise<void> {
        await this[collection].deleteOne(condition).catch(console.error);
    }

    private async trySaveDocToDb(document: Document): Promise<Document | void> {
        return await document.save().catch(console.error);
    }

    private constructor() {}

    private updateModels(): void {
        this.Category = connection.model<ICategory>('Category', CategorySchema);
        this.Post = connection.model<IPost>('Post', PostSchema);
    }

    public async dropDatabase() {
        await connection.dropDatabase();
    }
}
