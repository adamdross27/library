import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router';

// Get the backend URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8800";

const Books = () => {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        const fetchAllBooks = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/books`);
                setBooks(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        fetchAllBooks();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/books/${id}`);
            // Optimistically remove the deleted book from the state
            setBooks(books.filter(book => book.id !== id));
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div>
            <h1>Adam's Book Shop</h1>
            <div className='books'>
                {/* Ensure books is always an array */}
                {Array.isArray(books) && books.map((book) => (
                    <div className='book' key={book.id}>
                        {book.cover && <img src={`${process.env.REACT_APP_API_BASE_URL}${book.cover}`} alt={book.title} />}
                        <h2>{book.title}</h2>
                        <p>{book.desc}</p>
                        <span>${book.price}</span>
                        <button className="delete" onClick={() => handleDelete(book.id)}>Delete</button>
                        <button className="update">
                            <Link to={`/update/${book.id}`}>Update</Link>
                        </button>
                    </div>
                ))}
            </div>
            <Link to="/add"><button>Add New Book</button></Link>
        </div>
    );
};

export default Books;
