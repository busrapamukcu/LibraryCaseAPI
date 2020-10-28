BEGIN TRANSACTION;
create table Users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name text not null
);
create table Books(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name text not null
);
create table BorrowBooks(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bookID INTEGER not Null,
    userID INTEGER not Null,
    status INTEGER not Null,
    score INTEGER,
    FOREIGN KEY(bookID) REFERENCES Books(id),
    FOREIGN KEY(userID) REFERENCES Users(id)
);

insert into Users(name) values('Büşra');
insert into Users(name) values('Halil');
insert into Books(name) values('Nutuk');
insert into Books(name) values('Şu Çılgın Türkler');
insert into Books(name) values('Semerkant');

insert into BorrowBooks(bookid,userid,status,score)values(1,1,1,9);
insert into BorrowBooks(bookid,userid,status,score)values(1,2,1,6);
insert into BorrowBooks(bookid,userid,status,score)values(2,2,0,null);
insert into BorrowBooks(bookid,userid,status,score)values(3,1,0,null);
COMMIT;