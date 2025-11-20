# 🇵🇱 Polish Master Flashcards

A dynamic, full-stack web application for learning Polish vocabulary with flashcards.

## 🌟 Features

- **Interactive Flashcards**: Flip cards to reveal translations.
- **Study Modes**:
  - Filter by **Category** (e.g., Greetings, Food).
  - Filter by **Tags** (e.g., basic, difficult).
  - Toggle **Learning Direction** (🇵🇱 → 🇬🇧 or 🇬🇧 → 🇵🇱).
- **Word Management**:
  - Add new words with a rich, side-by-side editor.
  - Edit existing words.
  - Activate/Deactivate words to control your study set.
- **Persistence**: All data is saved locally to `data/words.json`.
- **Bulk Operations**:
  - **Import**: Upload JSON files or paste JSON text directly.
  - **Export**: Backup your word list to a JSON file.
- **Theme Support**: Toggle between **Light** and **Dark** modes.
- **Mobile Optimized**: Fully responsive design for learning on the go.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher) installed on your machine.

### Installation

1.  Clone the repository (or download the source code).
2.  Navigate to the project directory:
    ```bash
    cd flashcardhtml
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Running the App

1.  Start the server:
    ```bash
    npm start
    ```
    *Alternatively, for development with auto-restart:*
    ```bash
    npm run dev
    ```
2.  Open your browser and go to:
    ```
    http://localhost:3000
    ```

## 🧪 Running Tests

This project includes a suite of automated API tests using Jest and Supertest.

To run the tests:
```bash
npm test
```

## 📁 Project Structure

- **`server.js`**: Node.js/Express backend handling API requests and file persistence.
- **`public/`**: Frontend assets.
  - **`index.html`**: Main application structure.
  - **`css/styles.css`**: Styling and responsive design.
  - **`js/app.js`**: Frontend logic and state management.
  - **`js/api.js`**: API client module.
- **`data/`**: Storage for the word list (`words.json`).
- **`tests/`**: Automated test specifications.

## 🛠️ Technologies

- **Backend**: Node.js, Express
- **Frontend**: HTML5, CSS3 (Variables, Flexbox), Vanilla JavaScript (ES6+)
- **Testing**: Jest, Supertest
- **Data**: JSON (File-based persistence)

## 📝 License

----