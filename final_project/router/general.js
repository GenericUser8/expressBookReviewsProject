const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  /** @type {string | undefined} */
  const username = req.body.username;
  /** @type {string | undefined} */
  const password = req.body.password;

  //* Check if the username and password exist.
  if (!username || !password) {
    return res.status(400).json({ message: "username and password must be provided" });
  }

  //* Check if the username is already in use
  if (users.filter((user) => user.username === username).length > 0) {
    return res.status(400).json({ message: "username already in use"});
  }

  //* Otherwise add the new user
  users.push({ "username": username, "password": password });
  return res.status(200).json({ message: `user "${username}" added`})
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  const bookRequest = new Promise((resolve, reject) => {
    resolve(books);
  });
  bookRequest.then((books) => { res.status(200).send(JSON.stringify(books, null, 4)) });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  const bookISBNRequest = new Promise((resolve, reject) => {
    const book = books[isbn];
    if ( book === undefined ) { reject("Book does not exist."); }
    resolve(book);
  });

  bookISBNRequest.then(
    (book) => {
    res.status(200).json(book);
    },
    (reason) => {
      res.status(404).json({ "error": reason });
    }
  );

 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  
  const bookAuthorRequest = new Promise((resolve, reject) => {
    const foundBooks = [];
    for (const isbn in books) {
      if (books[isbn].author === author) { foundBooks.push(books[isbn]); }
    }
    resolve(foundBooks);
  });

  bookAuthorRequest.then((books) => {
    res.status(200).send(JSON.stringify(books, null, 4));
  });

});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;

  const bookTitleRequest = new Promise((resolve, reject) => {
    const foundBooks = [];
    for (const isbn in books) {
      if (books[isbn].title === title) { foundBooks.push(books[isbn]); }
    }
    resolve(foundBooks);
  });

  bookTitleRequest.then((books) => {
    res.status(200).send(JSON.stringify(books, null, 4));
  });
  
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  return res.status(200).send(JSON.stringify(
    books[isbn].reviews,
  null, 4))
});

module.exports.general = public_users;
