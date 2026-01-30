# Resumind - AI Resume Analyzer

Resumind is an intelligent, AI-powered tool designed to help job seekers optimize their resumes for Applicant Tracking Systems (ATS) and human recruiters. By leveraging advanced AI analysis, it provides detailed feedback on content, structure, and tone, ensuring your resume stands out in the competitive job market.

## What It Does

Resumind eliminates the guesswork from job applications. Users can upload their resumes PDF along with a target job description. The application then uses AI to analyze the document against industry standards and the specific job requirements. It generates a comprehensive report that includes an overall match score, ATS compatibility rating, and specific, actionable tips to improve skills, tone, and content structure. All your past analyses are saved, allowing you to track your improvements over time.

## Tech Stack

This project is built with a modern, high-performance stack:

- **Framework:** [React Router v7](https://reactrouter.com/) (SSR, Data Loading)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Backend & AI:** [Puter.js](https://puter.com/) (Auth, File System, KV Storage, AI Chat)
- **PDF Processing:** pdfjs-dist
- **Build Tool:** Vite

## Features

- **📄 Instant Resume Analysis:** Upload your resume and get immediate feedback.
- **🎯 Job Description Matching:** Tailor your resume to specific job roles for higher success rates.
- **📊 Detailed Scoring:**
  - **ATS Score:** Check how well your resume parses for automated systems.
  - **Content & Structure:** Get advice on formatting and clarity.
  - **Tone & Style:** Ensure your professional voice matches the industry.
- **💡 Actionable Insights:** Receive specific "Good" and "Improve" tips for every section.
- **🗄️ Application Dashboard:** Save and manage your history of analyzed resumes.
- **🔒 Secure Authentication:** Integrated user accounts via Puter.js.
