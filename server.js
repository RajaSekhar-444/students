const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const base64topdf = require('base64topdf');
const app = express();
app.use(cors({ origin: true }));

// Middleware
app.use(bodyParser.json());

// Storage for Multer (handling file uploads)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Sample user data (Replace with your logic to fetch actual user data)
const user = {
    full_name: "john_doe",
    dob: "17091999",
    email: "john@xyz.com",
    roll_number: "ABCD123"
};

// Helper to extract numbers and alphabets
function extractData(dataArray) {
    let numbers = [];
    let alphabets = [];
    let lowercaseAlphabets = [];

    dataArray.forEach(item => {
        if (!isNaN(item)) {
            numbers.push(item);
        } else if (typeof item === 'string') {
            alphabets.push(item);
            if (/[a-z]/.test(item)) {
                lowercaseAlphabets.push(item);
            }
        }
    });

    let highestLowercaseAlphabet = lowercaseAlphabets.length ? [Math.max(...lowercaseAlphabets)] : [];
    return { numbers, alphabets, highestLowercaseAlphabet };
}

// POST Route
app.post('/bfhl', upload.single('file'), (req, res) => {
    const { data, file_b64 } = req.body;

    if (!data) {
        return res.status(400).json({ is_success: false, message: 'Invalid input' });
    }

    const { numbers, alphabets, highestLowercaseAlphabet } = extractData(data);

    // File handling
    let fileValid = false;
    let fileMimeType = '';
    let fileSizeKb = 0;

    if (file_b64) {
        try {
            let fileBuffer = Buffer.from(file_b64, 'base64');
            let decodedFile = base64topdf.base64Decode(file_b64, 'output');
            fileMimeType = decodedFile.mimetype;
            fileSizeKb = fileBuffer.length / 1024;
            fileValid = true;
        } catch (error) {
            fileValid = false;
        }
    }

    const response = {
        is_success: true,
        user_id: `${user.full_name}_${user.dob}`,
        email: user.email,
        roll_number: user.roll_number,
        numbers,
        alphabets,
        highest_lowercase_alphabet: highestLowercaseAlphabet,
        file_valid: fileValid,
        file_mime_type: fileMimeType || '',
        file_size_kb: fileSizeKb || 0
    };

    res.json(response);
});

// GET Route
app.get('/bfhl', (req, res) => {
    res.status(200).json({
        operation_code: 1
    });
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
