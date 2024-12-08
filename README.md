CV.Chat
A modern web application for document analysis and querying powered by OpenAI's GPT models.
Features
📄 Document Upload & Processing
📝 Automatic Document Summarization
🔍 Natural Language Querying
🎨 Modern UI with Dark/Light Mode
📱 Responsive Design
Tech Stack
Framework: Next.js 15 with App Router
UI Components: Radix UI + Tailwind CSS
Styling: Tailwind CSS with CSS Variables
AI Integration: OpenAI GPT-3.5
State Management: React Hooks + Local Storage
Getting Started
Clone the repository:
git clone https://github.com/yourusername/cv.chat.git
cd cv.chat
Install dependencies:
npm install
# or
yarn install
Create a .env file in the root directory and add your OpenAI API key:
OPENAI_API_KEY=your_api_key_here
Run the development server:
npm run dev
# or
yarn dev
Open http://localhost:3000 with your browser to see the result.
Project Structure
src/
├── app/ # Next.js app router pages
├── components/ # Reusable UI components
├── hooks/ # Custom React hooks
├── lib/ # Utility functions and configurations
└── types/ # TypeScript type definitions
Features in Detail
Document Upload
Support for multiple file formats
Automatic document processing
Progress indicators
Document Summary
AI-powered document summarization
Relevance scoring
Summary storage for quick access
Document Querying
Natural language query interface
Context-aware responses
Real-time processing
Contributing
Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
License
This project is licensed under the MIT License - see the LICENSE file for details.
Acknowledgments
Radix UI (https://www.radix-ui.com/) for accessible UI components
Tailwind CSS (https://tailwindcss.com/) for styling
OpenAI (https://openai.com/) for AI capabilities