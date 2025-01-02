import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router';

const Add = () => {
    const [book, setBook] = useState({
        title: "",
        desc: "",
        price: null,
        cover: "",
    });

    const [file, setFile] = useState(null); // For storing the uploaded image file
    const navigate = useNavigate();

    // Handle form input changes
    const handleChange = (e) => {
        setBook((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
            // If no file selected, submit without cover
            try {
                await axios.post("http://localhost:8800/books", book);
                navigate("/");
            } catch (e) {
                console.log(e);
            }
        }
    }

    return (
        <div className='form'>
            <h1>Add New Book</h1>
            <input type="text" placeholder='title' name="title" onChange={handleChange} />
            <input type="text" placeholder='desc' name='desc' onChange={handleChange} />
            <input type="text" placeholder='price' name='price' onChange={handleChange} />

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
        </div>
    )
}

export default Add;
