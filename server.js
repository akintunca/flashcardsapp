const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'words.json');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for bulk uploads
app.use(express.static('public'));

// Helper to read words (Async)
const readWords = async () => {
    try {
        await fs.promises.access(DATA_FILE);
        const data = await fs.promises.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

// Helper to write words (Async)
const writeWords = async (words) => {
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(words, null, 2));
};

// API: Get all words
app.get('/api/words', async (req, res) => {
    try {
        const words = await readWords();
        res.json(words);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read words' });
    }
});

// API: Add a single word
app.post('/api/words', async (req, res) => {
    try {
        const words = await readWords();
        const newWord = {
            id: uuidv4(),
            active: true,
            tags: [],
            category: 'General',
            ...req.body
        };
        words.push(newWord);
        await writeWords(words);
        res.status(201).json(newWord);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save word' });
    }
});

// API: Update a word
app.put('/api/words/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        let words = await readWords();
        const index = words.findIndex(w => w.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Word not found' });
        }

        words[index] = { ...words[index], ...updates };
        await writeWords(words);
        res.json(words[index]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update word' });
    }
});

// API: Delete a word
app.delete('/api/words/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let words = await readWords();
        const initialLength = words.length;
        words = words.filter(w => w.id !== id);

        if (words.length === initialLength) {
            return res.status(404).json({ error: 'Word not found' });
        }

        await writeWords(words);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete word' });
    }
});

// API: Bulk Upload
app.post('/api/words/bulk', async (req, res) => {
    try {
        const newWords = req.body;
        if (!Array.isArray(newWords)) {
            return res.status(400).json({ error: 'Input must be an array' });
        }

        const words = await readWords();
        const processedWords = newWords.map(w => ({
            id: uuidv4(),
            active: true,
            tags: [],
            category: 'General',
            ...w
        }));

        const updatedWords = [...words, ...processedWords];
        await writeWords(updatedWords);
        res.status(201).json({ count: processedWords.length });
    } catch (err) {
        res.status(500).json({ error: 'Failed to bulk upload' });
    }
});

// API: Import (Overwrite/Merge)
app.post('/api/words/import', async (req, res) => {
    try {
        const { words: importedWords, mode } = req.body; // mode: 'overwrite' or 'merge'
        if (!Array.isArray(importedWords)) {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        let finalWords;
        if (mode === 'overwrite') {
            finalWords = importedWords;
        } else {
            const currentWords = await readWords();
            finalWords = [...currentWords, ...importedWords];
        }

        await writeWords(finalWords);
        res.json({ success: true, count: finalWords.length });
    } catch (err) {
        res.status(500).json({ error: 'Failed to import' });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;
