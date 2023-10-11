const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
  
    // Check if username or password is missing
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }
  
    // Check if username is valid
    if (!isValid(username)) {
      return res.status(400).json({ message: "Invalid username" });
    }
  
    // Check if username already exists
    const userExists = users.some((user) => user.username === username);
    if (userExists) {
      return res.status(409).json({ message: "Username already exists" });
    }
  
    // Register the new user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
    //Write your code here
    console.log(req.params);
    return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
    const { isbn } = req.params;
    const isbnNumber = parseInt(isbn, 10);
  
    // Find book with matching ISBN
    const matchingBook = [];
    for (const bookId in books) {
      if (books[bookId].isbn === isbnNumber) {
        matchingBook.push({ id: bookId, ...books[bookId] });
      }
    }
  
    if (matchingBook.length > 0) {
      return res.status(200).json(matchingBook);
    } else {
      // No book with the provided ISBN found
      return res.status(404).json({ error: "No book with the provided ISBN found" });
    }
  });
  
  
// Get book details based on author
public_users.get("/author/:author", function (req, res) {
    const { author } = req.params;
  
    // Find books with matching author
    const matchingBooks = [];
    for (const bookId in books) {
      if (books[bookId].author === author) {
        matchingBooks.push({ id: bookId, ...books[bookId] });
      }
    }
  
    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      // No books by the author found
      return res.status(404).json({ error: "No books by the author found" });
    }
  });

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
    const encodedTitle = req.params.title; // Retrieve the encoded title from the request parameters
    const title = decodeURIComponent(encodedTitle); // Decode the title
  
    // Find books with matching title
    const matchingBooks = [];
    for (const bookId in books) {
      if (books[bookId].title === title) {
        matchingBooks.push({ id: bookId, ...books[bookId] });
      }
    }
  
    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      // No books with the title found
      return res.status(404).json({ error: "No books with the title found" });
    }
  });

// Get book review based on ISBN
public_users.get("/review/:isbn", function (req, res) {
    const { isbn } = req.params;
    const bookISBN = parseInt(isbn, 10);  // Convert string to integer

    // Check if book exists with the given ISBN
    const book = Object.values(books).find(book => book.isbn === bookISBN);

    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ error: "No book with the provided ISBN found" });
    }
});

public_users.get("/books", async function (req, res) {
    try {
        const response = await axios.get("http://localhost:5000/");  // Assuming the server is running on port 5000
        const booksList = response.data;
        res.status(200).json(booksList);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve books" });
    }
});

public_users.get("/async/isbn/:isbn", async function (req, res) {
    const { isbn } = req.params;

    try {
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        const bookDetails = response.data;
        
        if (bookDetails && bookDetails.length > 0) {
            res.status(200).json(bookDetails);
        } else {
            res.status(404).json({ error: "No book with the provided ISBN found" });
        }

    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve book by ISBN" });
    }
});


public_users.get("/async/author/:author", async function (req, res) {
    const { author } = req.params;

    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        const booksByAuthor = response.data;
        
        if (booksByAuthor && booksByAuthor.length > 0) {
            res.status(200).json(booksByAuthor);
        } else {
            res.status(404).json({ error: "No books by the author found" });
        }

    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve books by author" });
    }
});


public_users.get("/async/title/:title", async function (req, res) {
    const encodedTitle = req.params.title;
    const title = decodeURIComponent(encodedTitle);

    try {
        const response = await axios.get(`http://localhost:5000/title/${encodedTitle}`);
        const booksByTitle = response.data;
        
        if (booksByTitle && booksByTitle.length > 0) {
            res.status(200).json(booksByTitle);
        } else {
            res.status(404).json({ error: "No books with the title found" });
        }

    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve books by title" });
    }
});


module.exports.general = public_users;
