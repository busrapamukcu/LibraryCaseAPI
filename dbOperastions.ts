import { ConnectionOptions, createConnection, Connection, InsertResult } from "typeorm"
import { Users, Books, BorrowBooks, UserDetail, UserBook, BookDetail } from "./entity/entities"
const options: ConnectionOptions = {
    type: "sqlite",
    database: `./library.db`,
    entities: [Users, Books, BorrowBooks],
    logging: true
}

export default class DBOperations {
    private activeConection: Connection | null;
    constructor() {
        this.activeConection = null;

    }

    private async getConnection(): Promise<Connection> {
        if (this.activeConection == null || !this.activeConection.isConnected) {
            this.activeConection = await createConnection(options);
        }
        return this.activeConection
    }


    public async GetUsers(): Promise<Users[]> {
        const connection = await this.getConnection();
        return await connection.getRepository(Users).find();
    }
    public async CreateUser(name: string): Promise<InsertResult> {
        const connection = await this.getConnection();
        return connection
            .createQueryBuilder()
            .insert()
            .into(Users)
            .values(
                { name: name }
            )
            .execute();


    }
    public async GetUserDetail(id: number): Promise<UserDetail> {
        let userDetail: UserDetail = new UserDetail();
        const connection = await this.getConnection();

        const foundUser = await connection
            .getRepository(Users)
            .createQueryBuilder("users")
            .where("users.id = :id", { id: id })
            .getOne();

        if (foundUser) {
            userDetail.id = foundUser.id;
            userDetail.name = foundUser.name;
            const pastBooksData = await connection
                .getRepository(BorrowBooks)
                .createQueryBuilder("BorrowBooks")
                .leftJoinAndSelect("BorrowBooks.book", "book")
                .where("BorrowBooks.userID = :id and BorrowBooks.status=1", { id: id }).getMany();

            let pastBooks: UserBook[] = pastBooksData.map(item => {
                let userBook: UserBook = {
                    name: item.book.name,
                    userScore: item.score
                }
                return userBook;
            });


            const presentBooksData = await connection
                .getRepository(BorrowBooks)
                .createQueryBuilder("BorrowBooks")
                .leftJoinAndSelect("BorrowBooks.book", "book")
                .where("BorrowBooks.userID = :id and BorrowBooks.status=0", { id: id }).getMany();

            let presentBooks: UserBook[] = presentBooksData.map(item => {
                let userBook: UserBook = {
                    name: item.book.name,
                    userScore: undefined
                }
                return userBook;
            });

            userDetail.books = { past: pastBooks, present: presentBooks };


        }
        else {
            throw "User Not Found";

        }


        return userDetail;
    }

    public async GetBooks(): Promise<Books[]> {
        const connection = await this.getConnection();
        return await connection.getRepository(Books).find();
    }

    public async GetBookDetail(id: number): Promise<BookDetail> {

        return new Promise<BookDetail>((resolve, reject) => {
            this.getConnection().then((connection: Connection) => {
                let bookDetail: BookDetail = { id: 0, name: "", score: undefined };
                connection
                    .getRepository(Books)
                    .createQueryBuilder("Books")
                    .select(["books.id", "books.name"])
                    .addSelect("avg(borrowbooks.score)", "score")
                    .leftJoinAndSelect("Books.borrowBooks", "borrowBooks")
                    .where("Books.id = :id", { id: id })
                    .groupBy("books.id,books.name")
                    .getRawOne().then(bookData => {
                        if (bookData) {
                            bookDetail.id = bookData.id;
                            bookDetail.name = bookData.name;
                            bookDetail.score = bookData.score ? bookData.score : undefined;
                            resolve(bookDetail);
                        } else {
                            reject("Book Not Found");

                        }

                        return bookDetail;
                    }).catch((error) => {
                        console.error(error);
                        reject(error);
                    });
            }).catch((error) => {
                console.error(error);
                reject(error);
            })

        });
    }

    public async CreateBook(name: string): Promise<InsertResult> {
        const connection = await this.getConnection();
        return connection
            .createQueryBuilder()
            .insert()
            .into(Books)
            .values(
                { name: name }
            )
            .execute();


    }

    public BorrowBook(userId: number, bookId: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getConnection().then(async (connection: Connection) => {
                let user = await connection.getRepository(Users).findOne(userId);
                if (!user) reject("User Not Found");
                let book = await connection.getRepository(Books).findOne(bookId);
                if (!book) reject("Book Not Found");
                if (book && user) {

                    const isBorrow = await connection
                        .getRepository(BorrowBooks)
                        .createQueryBuilder("BorrowBooks")
                        .leftJoinAndSelect("BorrowBooks.book", "book")
                        .where("BorrowBooks.bookId = :id and BorrowBooks.status=0", { id: bookId }).getCount() > 0;

                    if (isBorrow) {
                        reject(`${book.name}  is a borrowed`);
                    }
                    else {
                        connection
                            .createQueryBuilder()
                            .insert()
                            .into(BorrowBooks)
                            .values(
                                {
                                    bookID: book.id,
                                    userID: user.id,
                                    status: 0
                                }
                            )
                            .execute().then((result) => resolve(result)).catch((error) => reject(error));
                    }

                }

            
            }).catch((error) => reject(error));
        });
    }

    public ReturnBook(userId: number, bookId: number,score:number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getConnection().then(async (connection: Connection) => {
                let user = await connection.getRepository(Users).findOne(userId);
                if (!user) reject("User Not Found");
                let book = await connection.getRepository(Books).findOne(bookId);
                if (!book) reject("Book Not Found");
                if (book && user) {

                    const isBorrow = await connection
                        .getRepository(BorrowBooks)
                        .createQueryBuilder("BorrowBooks")
                        .leftJoinAndSelect("BorrowBooks.book", "book")
                        .where("BorrowBooks.bookId = :bookid and BorrowBooks.userId = :userid and BorrowBooks.status=0 ", { bookid: bookId,userid:userId }).getCount() > 0;

                    if (!isBorrow) {
                        reject(`${book.name}  is a hasn't borrowed`);
                    }
                    else {
                        connection
                            .createQueryBuilder()
                            .update(BorrowBooks)
                            .set({status:1,score:score})
                            .where("BorrowBooks.bookId = :bookid and BorrowBooks.userId = :userid and BorrowBooks.status=0 ",{ bookid: bookId,userid:userId })                            
                            .execute().then((result) => resolve(result)).catch((error) => reject(error));
                    }

                }

            
            }).catch((error) => reject(error));
        });
    }
}


