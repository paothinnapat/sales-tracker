import express from 'express';
import cors from 'cors';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// Initialize Google Sheets Doc
const getDoc = async () => {
    const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo(); // loads document properties and worksheets
    return doc;
};

app.post('/api/submit-sale', async (req, res) => {
    try {
        const { date, store, items, total } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'No items to record.' });
        }

        const doc = await getDoc();
        const sheet = doc.sheetsByIndex[0]; // Assuming data goes into the first sheet
        const headers = ['Date', 'Store Plant', 'Product Name', 'Price', 'Quantity', 'Total'];

        try {
            await sheet.loadHeaderRow();
        } catch (e) {
            // Likely empty sheet, so set headers
            console.log('Sheet appears empty (no headers), initializing...');
            await sheet.setHeaderRow(headers);
        }

        // Prepare rows
        // Columns: Date, Store Plant, Product Name, Price, Quantity, Total
        const rowsToAdd = items.map(item => ({
            'Date': date,
            'Store Plant': store,
            'Product Name': item.product,
            'Price': item.price,
            'Quantity': item.quantity,
            'Total': item.subtotal
        }));

        await sheet.addRows(rowsToAdd);

        console.log(`Recorded ${rowsToAdd.length} sales.`);
        res.status(200).json({ message: 'Sales recorded successfully', count: rowsToAdd.length });

    } catch (error) {
        console.error('Error submitting to Google Sheets:', error);
        res.status(500).json({ error: 'Failed to record sales', details: error.message });
    }
});



// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
