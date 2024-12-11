const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

/**
 * Checks if the username is in the users list.
 * @param {string} username 
 * @returns {boolean} If the username is in use.
 */
const isValid = (username) => {
  return users.filter((user) => user.username === username).length > 0;
}

/** 
 * Check if a given user of password matches internal records.
 * @param {string} username
 * @param {string} password
 * @returns {boolean} Whether the credentials are valid or not.
 */
const authenticatedUser = (username, password) => {
  const possibleUsers = users.filter((user) => user.username === username);
  if (possibleUsers.length < 1) { return false; }
  return possibleUsers[0].password === password;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  /** @type {string | undefined} */
  const username = req.body.username;
  /** @type {string | undefined} */
  const password = req.body.password;

  //* Check that both username and password is provided.
  if (!username || !password) {
    return res.status(400).json({ "message": "username and password must be provided"})
  }

  //* Check that the username and password are valid.
  if (!authenticatedUser(username, password)) {
    return res.status(400).json({ "message": "incorrect username and/or password" });
  }

  //* Provide a signed JWT to the session.
  const accessToken = jwt.sign({ data: password }, "fingerprint_customer", { expiresIn: 60 * 60 });
  req.session.authorization = {
    accessToken, username
  }

  return res.status(200).json({ "message": "User successfully logged in" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body;
  const username = req.user;

  //* Check if the book exists.
  if (!(isbn in Object.keys(books))) {
    return res.status(404).json({ "message": "Book not found." })
  }

  //* Check if the review exists.
  if (review === undefined) {
    return res.status(400).json({ "message": "A review must be provided." });
  }

  //* Check if a username can be found.
  if (username === undefined) {
    return res.status(401).json({ "message": "Unknown user." });
  }

  //* Insert or Upsert the review
  books[isbn].reviews[username] = review;

  return res.status(200).json({ "message": "Review updated or added successfully." })
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user;

  //* Check if the book exists
  if (!(isbn in Object.keys(books))) {
    return res.status(404).json({ "message": "Book not found." });
  }

  //* Check if the username exists
  if (username === undefined) {
    return res.status(401).json({ "message": "Unknown user." });
  }

  //* Check if the review to delete exists
  if (books[isbn].reviews[username] === undefined) {
    return res.status(404).json({ "message": "Review does not exist." });
  }

  //* Remove the review.
  delete books[isbn].reviews[username];

  return res.status(200).json({ "message": "Review deleted successfully." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
