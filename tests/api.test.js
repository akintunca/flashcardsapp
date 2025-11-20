const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../server');

const TEST_DATA_FILE = path.join(__dirname, '../data/words.json');
const BACKUP_FILE = path.join(__dirname, '../data/words.backup.json');

describe('Flashcard API Endpoints', () => {
    // Backup data before tests
    beforeAll(() => {
        if (fs.existsSync(TEST_DATA_FILE)) {
            fs.copyFileSync(TEST_DATA_FILE, BACKUP_FILE);
        }
    });

    // Restore data after tests
    afterAll(() => {
        if (fs.existsSync(BACKUP_FILE)) {
            fs.copyFileSync(BACKUP_FILE, TEST_DATA_FILE);
            fs.unlinkSync(BACKUP_FILE);
        }
    });

    describe('GET /api/words', () => {
        it('should return an array of words', async () => {
            const res = await request(app).get('/api/words');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBeTruthy();
        });
    });

    describe('POST /api/words', () => {
        it('should create a new word', async () => {
            const newWord = {
                polish: 'Test',
                english: 'Test',
                category: 'Testing'
            };
            const res = await request(app).post('/api/words').send(newWord);
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.polish).toBe('Test');
        });
    });

    describe('PUT /api/words/:id', () => {
        it('should update an existing word', async () => {
            // First create a word
            const wordRes = await request(app).post('/api/words').send({
                polish: 'Update Me',
                english: 'Update Me'
            });
            const wordId = wordRes.body.id;

            // Then update it
            const res = await request(app).put(`/api/words/${wordId}`).send({
                active: false
            });
            expect(res.statusCode).toEqual(200);
            expect(res.body.active).toBe(false);
        });
    });

    describe('POST /api/words/bulk', () => {
        it('should add multiple words', async () => {
            const words = [
                { polish: 'Bulk1', english: 'Bulk1' },
                { polish: 'Bulk2', english: 'Bulk2' }
            ];
            const res = await request(app).post('/api/words/bulk').send(words);
            expect(res.statusCode).toEqual(201);
            expect(res.body.count).toBe(2);
        });
    });
});
