# IELTS AI Coach

An AI-powered application designed to help students prepare for the IELTS exam. This app leverages **Google Gemini** to generate realistic practice content, score user responses, and provide detailed feedback across all four IELTS modules: Reading, Listening, Writing, and Speaking.

## 🚀 Key Features

### 📖 Reading Practice
- **Unlimited Content**: Generate unique reading passages (600-750 words) on any topic.
- **Realistic Exam Structure**: Each passage comes with **13-14** questions.
- **Diverse Question Types**: Includes Multiple Choice (MCQ), True/False/Not Given, Fill in the Blanks, and Summary Completion.
- **Auto-Scoring**: Instant feedback and scoring with explanations for answers.

### 🎧 Listening Practice
- **Full Exam Simulation**: Simulates the 4-part IELTS Listening test structure.
    -   **Part 1**: Social Dialogue (e.g., Form filling).
    -   **Part 2**: Social Monologue.
    -   **Part 3**: Academic Discussion.
    -   **Part 4**: Academic Lecture.
- **Interactive Audio**: Uses text-to-speech to play generated scripts for each section.
- **Tabbed Navigation**: Seamlessly switch between parts and answer questions.

### ✍️ Writing Assistant
- **Instant Grading**: Submit essays to receive an estimated Band Score (0-9).
- **Detailed Feedback**: Analysis of vocabulary, grammar, coherence, and task response.

### 🗣️ Speaking Coach
- **Fluency Analysis**: Record your answers (simulated) and get feedback on pronunciation and coherence.
- **Topic Generation**: Practice with improved Cue Card topics.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI Model**: [Google Generative AI](https://ai.google.dev/) (Gemini Flash)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Google Gemini API Key

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/SwapnilSaha5768/IELTS_with_AI_Chatbot.git
    cd IELTS_with_AI_Chatbot
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env.local` file in the root directory and add your Gemini API key:
    ```bash
    GOOGLE_API_KEY=your_api_key_here
    ```

4.  **Run the application**:
    ```bash
    npm run dev
    ```


## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any features or bug fixes.

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
