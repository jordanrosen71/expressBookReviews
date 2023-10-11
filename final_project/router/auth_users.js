const { request } = require('express');
const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Check if username is non-empty and has a minimum length of 5 characters
    return username && username.length >= 5;
};

const authenticatedUser = (username, password) => {
    // Check if provided username and password matches our records
    const user = users.find((u) => u.username === username);
    return user && user.password === password;
};
  
//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    if (authenticatedUser(username, password)) {
      // Ideally, you'd want to sign and send a JWT token here for further authentication
      req.session.authenticated = true;
      return res.status(200).json({ message: "Login successful" });
    } else {
      return res.status(401).json({ message: "Invalid username or password" });
    }
});
  
// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

    const { isbn } = req.params;
    const bookISBN = parseInt(isbn, 10);
    const review = req.query.review;

    // Assuming username and password are stored in session
    const username = req.session.username;
    const password = req.session.password; // Assuming password is stored in session, which is typically not recommended    

    // Check if the user is authenticated
    if (!req.session.authenticated) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    // Check if the book with the given ISBN exists
    if (books[bookISBN]) {
        // Check if a review by the user already exists
        if (books[bookISBN].reviews[username]) {
            books[bookISBN].reviews[username] = review;
            return res.status(200).json({ message: "Review updated successfully." });
        } else {
            books[bookISBN].reviews[username] = review;
            return res.status(201).json({ message: "Review added successfully." });
        }
    } else {
        return res.status(404).json({ error: "No book with the provided ISBN found" });
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const bookISBN = parseInt(isbn, 10);
    
    // Assuming username is stored in session
    const username = req.session.username;

    // Check if the user is authenticated
    if (!req.session.authenticated) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    // Check if the book with the given ISBN exists
    if (books[bookISBN]) {
        // Check if a review by the user exists
        if (books[bookISBN].reviews[username]) {
            // Delete the user's review
            delete books[bookISBN].reviews[username];
            return res.status(200).json({ message: "Review deleted successfully." });
        } else {
            return res.status(404).json({ error: "No review by the user found for the provided ISBN." });
        }
    } else {
        return res.status(404).json({ error: "No book with the provided ISBN found" });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
