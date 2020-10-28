import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";

@Entity("Users")
export class Users {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @OneToMany(type => BorrowBooks, borrowBooks => borrowBooks.user)
    borrowBooks!: BorrowBooks[];
}

@Entity("Books")
export class Books {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @OneToMany(type => BorrowBooks, borrowBooks => borrowBooks.book)
    borrowBooks!: BorrowBooks[];

}

@Entity("BorrowBooks")
export class BorrowBooks {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    bookID!: number;

    @Column()
    userID!: number;

    @Column()
    status!: number;

    @Column()
    score!: number;


    @ManyToOne(type => Users, user => user.borrowBooks)
    user!: Users;

    @ManyToOne(type => Books, book => book.borrowBooks)
    book!: Books;
}
export interface UserBook {
    name: string,
    userScore: number | undefined;
}
export class UserDetail {

    id!: number;
    name!: string;
    books!: {
        past: UserBook[],
        present: UserBook[]
    }
}
export interface BookDetail {
    id: number,
    name: string,
    score: number | undefined;
}