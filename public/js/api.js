const API_URL = '/api/words';

export const api = {
    async getWords() {
        const res = await fetch(API_URL);
        return res.json();
    },

    async addWord(word) {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(word)
        });
        return res.json();
    },

    async updateWord(id, updates) {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return res.json();
    },

    async deleteWord(id) {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete word');
        return response.json();
    },

    async bulkUpload(words) {
        const res = await fetch(`${API_URL}/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(words)
        });
        return res.json();
    },

    async importWords(words, mode) {
        const res = await fetch(`${API_URL}/import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ words, mode })
        });
        return res.json();
    }
};
