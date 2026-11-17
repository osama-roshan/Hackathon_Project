# Setup Steps

1. Open this folder in VS Code.
2. Open the terminal and run: npm install
3. Make a copy of .env.example and name it .env
4. Fill in the values in .env:
   - GEMINI_API_KEY from Google AI Studio
   - SUPABASE_URL and SUPABASE_KEY from Supabase, Project Settings, API
5. In Supabase, open SQL Editor, paste the text of supabase.sql, and press Run.
6. Run: npm start
7. Open http://localhost:3000 in the browser.

Never share your .env file or push it to GitHub.
