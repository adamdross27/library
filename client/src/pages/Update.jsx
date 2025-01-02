import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';

// Get the backend URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8800";

const Update = () => {
    const [book, setBook] = useState({
        title: "",
        desc: "",
        price: null,
        cover: "",
    });

    const [file, setFile] = useState(null); // To store the uploaded image
    const [priceError, setPriceError] = useState(""); // For price validation error
    const [titleError, setTitleError] = useState(""); // For title validation error
    const [descError, setDescError] = useState(""); // For description validation error
    const location = useLocation();
    const navigate = useNavigate();

    const bookId = location.pathname.split("/")[2];

    // Fetch the book data on component mount
    useEffect(() => {
        const fetchBook = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/books/${bookId}`);
                setBook(response.data);
            } catch (e) {
                console.log(e);
            }
        };

        fetchBook();
    }, [bookId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBook((prev) => ({ ...prev, [name]: value }));

        if (name === "price") {
            if (isNaN(value) || value <= 0) {
                setPriceError("Price must be a valid positive number");
            } else {
                setPriceError("");
            }
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setBook((prev) => ({ ...prev, cover: selectedFile.name }));
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const selectedFile = e.dataTransfer.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setBook((prev) => ({ ...prev, cover: selectedFile.name }));
        }
    };

    const handleClick = async (e) => {
        e.preventDefault();

        if (!book.title) {
            setTitleError("Title is required.");
            return;
        } else {
            setTitleError("");
        }

        if (!book.desc) {
            setDescError("Description is required.");
            return;
        } else {
            setDescError("");
        }

        if (priceError || !book.price) {
            setPriceError("Please provide a valid price.");
            return;
        }

        const coverImage = file ? file.name : "/uploads/default-cover.jpg";

        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const fileUploadResponse = await axios.post(`${API_BASE_URL}/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const fileUrl = fileUploadResponse.data.filePath;

                await axios.put(`${API_BASE_URL}/books/${bookId}`, { ...book, cover: fileUrl });
                navigate("/");
            } catch (e) {
                console.log(e);
            }
        } else {
            try {
                await axios.put(`${API_BASE_URL}/books/${bookId}`, { ...book, cover: coverImage });
                navigate("/");
            } catch (e) {
                console.log(e);
            }
        }
    };

    return (
        <div className='form'>
            <h1>Update Book</h1>

            <input
                type="text"
                placeholder='title'
                name="title"
                value={book.title}
                onChange={handleChange}
            />
            {titleError && <p style={{ color: "red" }}>{titleError}</p>}

            <input
                type="text"
                placeholder='desc'
                name='desc'
                value={book.desc}
                onChange={handleChange}
            />
            {descError && <p style={{ color: "red" }}>{descError}</p>}

            <input
                type="text"
                placeholder='price'
                name='price'
                value={book.price}
                onChange={handleChange}
            />
            {priceError && <p style={{ color: "red" }}>{priceError}</p>}

            <div
                className='file-upload'
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                    border: '2px dashed #ccc',
                    padding: '20px',
                    textAlign: 'center',
                    margin: '10px 0',
                }}
            >
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <p>Select a Cover Image!</p>
                {file && <p>Selected File: {file.name}</p>}
            </div>

            <button className="formButton" onClick={handleClick}>Update</button>
            <Link to={`/`}>
                <button className="return">Return</button>
            </Link>
        </div>
    );
};

export default Update;
