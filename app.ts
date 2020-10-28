import express from "express";
import bodyParser from "body-parser";
import DBOperations from "./dbOperastions";

const { param, validationResult, check } = require('express-validator');
var expressApp = express();
const dbOperations = new DBOperations();


expressApp.use(bodyParser.json());
//expressApp.use((req) => { console.log(req); });
expressApp.get("/users", (req, resp) => {
    dbOperations.GetUsers().then((list) => {
        resp.json(list);
    }).catch((error) => {
        resp.statusCode = 500;
        resp.json(error);
    }
    )


});

expressApp.get("/users/:userId", param("userId").not().isEmpty().isNumeric(), (req, resp) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return resp.status(422).json({ errors: errors.array() });
    }
    let userId: number = parseInt(req.params.userId);
    dbOperations.GetUserDetail(userId).then((list) => {
        resp.json(list);
    }).catch((error) => {
        resp.statusCode = 500;
        resp.json(error);
    }
    )

});
expressApp.post("/users", check('name').isLength({ min: 3 }), (req, resp) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return resp.status(422).json({ errors: errors.array() });
    }
    dbOperations.CreateUser(req.body.name.trim()).then(() => {
        resp.statusCode = 200;
        resp.statusMessage = `Create User:${req.body.name}`;
        resp.json({});
    })

});

expressApp.get("/books", (req, resp) => {

    dbOperations.GetBooks().then((list) => {
        resp.json(list);
    }).catch((error) => {
        resp.statusCode = 500;
        resp.json(error);
    }
    )

});
expressApp.get("/books/:bookId", param("bookId").not().isEmpty().isNumeric(), (req, resp) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return resp.status(422).json({ errors: errors.array() });
    }
    let bookId: number = parseInt(req.params.bookId);
    dbOperations.GetBookDetail(bookId).then((bookDetail) => {
        resp.json(bookDetail);
    }).catch((error) => {
        resp.statusCode = 500;
        resp.json(error);
    }
    )
});

expressApp.post("/books", check('name').isLength({ min: 3 }), (req, resp) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return resp.status(422).json({ errors: errors.array() });
    }
    dbOperations.CreateBook(req.body.name.trim()).then(() => {
        resp.statusCode = 200;
        resp.statusMessage = `Create Book:${req.body.name}`;
        resp.json({});
    })

});



expressApp.post("/users/:userId/borrow/:bookId",param("userId").not().isEmpty().isNumeric(),param("bookId").not().isEmpty().isNumeric(), (req, resp) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return resp.status(422).json({ errors: errors.array() });
    }
    let userId: number = parseInt(req.params.userId);
    let bookId: number = parseInt(req.params.bookId);
    dbOperations.BorrowBook(userId,bookId).then((result) => {
        resp.json(result);
    }).catch((error) => {
        resp.statusCode = 500;
        resp.json(error);
    }
    )

});


expressApp.post("/users/:userId/return/:bookId",param("userId").not().isEmpty().isNumeric(),param("bookId").not().isEmpty().isNumeric(),check('score').not().isEmpty().isNumeric(), (req, resp) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return resp.status(422).json({ errors: errors.array() });
    }
    let userId: number = parseInt(req.params.userId);
    let bookId: number = parseInt(req.params.bookId);
    let score:number =parseInt(req.body.score);
    if(score<0 && score > 10)
    {
        return resp.status(422).json({ errors: "Score  must be 0- 10" });
    }

    dbOperations.ReturnBook(userId,bookId,score).then((result) => {
        resp.json(result);
    }).catch((error) => {
        resp.statusCode = 500;
        resp.json(error);
    }
    )

});

console.log("API START  localhost:3000");
expressApp.listen(3000);