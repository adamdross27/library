import dotenv from 'dotenv';
import express from "express";
import mysql from "mysql";
import cors from "cors";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url'; 
import { dirname } from 'path';  

// Load environment variables
dotenv.config();

const app = express();

// Set up MySQL connection
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database as id ' + db.threadId);
});

app.use(express.json());
app.use(cors());
// Serve static files from 'uploads' folder

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir); // Create the 'uploads' directory if it doesn't exist
}



// Resolve the current directory path properly
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Specify the directory where files will be uploaded
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + path.extname(file.originalname); // Unique filename
        cb(null, file.fieldname + '-' + uniqueSuffix); // Set filename to fieldname + timestamp
    }
});

const upload = multer({ storage: storage });

// Routes

app.get("/", (req, res) => {
    res.json("Hello, this is the backend");
});

app.get("/books", (req, res) => {
    const q = "SELECT * FROM books";
    db.query(q, (err, data) => {
        if (err) return res.json("ERROR! " + err);
        return res.json(data);
    });
});

// File upload route
app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        res.json({ filePath: `/uploads/${req.file.filename}` }); // Respond with the file path
    } else {
        res.status(400).json({ message: 'No file uploaded' });
    }
});

// Add book route
app.post("/books", (req, res) => {
    const { title, desc, price, cover } = req.body;
    const q = "INSERT INTO books (`title`, `desc`, `price`, `cover`) VALUES (?)";
    const values = [title, desc, price, cover];

    db.query(q, [values], (err, data) => {
        if (err) return res.json("Error: " + err);
        return res.json("Book has been added to the library!");
    });
});

// Delete book route
app.delete("/books/:id", (req, res) => {
    const bookId = req.params.id;
    const q = "DELETE FROM books WHERE id = ?";

    db.query(q, [bookId], (err, data) => {
        if (err) return res.json(err);
        return res.json("Book has been deleted successfully");
    });
});

// Update book route
app.put("/books/:id", (req, res) => {
    const bookId = req.params.id;
    const { title, desc, price, cover } = req.body;
    const q = "UPDATE books SET `title` = ?, `desc` = ?, `price` = ?, `cover` = ? WHERE id = ?";
    const values = [title, desc, price, cover];

    db.query(q, [...values, bookId], (err, data) => {
        if (err) return res.json(err);
        return res.json("Book has been updated successfully");
    });
});

app.listen(8800, () => {
    console.log("Connected to backend");
});
