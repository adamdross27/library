import axios from 'axios';
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router';

const Add = () => {
    const [book, setBook] = useState({
        title: "",
        desc: "",
        price: null,
        cover: "",
    });

    const [file, setFile] = useState(null); // For storing the uploaded image file
    const [priceError, setPriceError] = useState(""); // For price validation error
    const [titleError, setTitleError] = useState(""); // For title validation error
    const [descError, setDescError] = useState(""); // For description validation error
    const navigate = useNavigate();

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setBook((prev) => ({ ...prev, [name]: value }));

        // Validate price if it's the price field
        if (name === "price") {
            if (isNaN(value) || value <= 0) {
                setPriceError("Price must be a valid positive number");
            } else {
                setPriceError(""); // Clear error if valid
            }
        }
    };

    // Handle file selection
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setBook((prev) => ({ ...prev, cover: selectedFile.name })); // Update cover field
        }
    };

    // Handle drag-and-drop file upload
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
            setBook((prev) => ({ ...prev, cover: selectedFile.name })); // Update cover field
        }
    };

    // Handle form submission
    const handleClick = async (e) => {
        e.preventDefault();
    
        // Validate if title and desc are provided
        if (!book.title) {
            setTitleError("Title is required.");
            return;
        } else {
            setTitleError(""); // Clear title error if valid
        }
    
        if (!book.desc) {
            setDescError("Description is required.");
            return;
        } else {
            setDescError(""); // Clear description error if valid
        }
    
        // Validate if price is valid before submitting
        if (priceError || !book.price) {
            setPriceError("Please provide a valid price.");
            return;
        }
    
        // Set default cover image if no file is selected
        const coverImage = file ? file.name : "/uploads/default-cover.jpg";  // Use relative URL
    
        // If a file is selected, upload it to the server first
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
    
            try {
                const fileUploadResponse = await axios.post("http://localhost:8800/upload", formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
    
                // Assuming the file upload returns a file path or URL
                const fileUrl = fileUploadResponse.data.filePath;
    
                // Now, submit the book data with the image URL
                await axios.post("http://localhost:8800/books", { ...book, cover: fileUrl });
                navigate("/");
    
            } catch (e) {
                console.log(e);
            }
        } else {
            // If no file selected, submit without cover (use default cover image)
            try {
                await axios.post("http://localhost:8800/books", { ...book, cover: coverImage });
                navigate("/");
            } catch (e) {
                console.log(e);
            }
        }
    }
    
    return (
        <div className='form'>
            <h1>Add New Book</h1>

            {/* Title Input with Error Handling */}
            <input
                type="text"
                placeholder='title'
                name="title"
                value={book.title}
                onChange={handleChange}
            />
            {titleError && <p style={{ color: "red" }}>{titleError}</p>}

            {/* Description Input with Error Handling */}
            <input
                type="text"
                placeholder='desc'
                name='desc'
                value={book.desc}
                onChange={handleChange}
            />
            {descError && <p style={{ color: "red" }}>{descError}</p>}

            {/* Price Input with Error Handling */}
            <input
                type="text"
                placeholder='price'
                name='price'
                value={book.price}
                onChange={handleChange}
            />
            {priceError && <p style={{ color: "red" }}>{priceError}</p>} {/* Display price error */}

            {/* File Upload Section */}
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

                {file && <p>Selected File: {file.name}</p>} {/* Show the selected file name */}
            </div>

            <button onClick={handleClick}>Add</button>
            <Link to={`/`}>
                <button className="return">Return</button>
            </Link>
        </div>
    );
}

export default Add;
