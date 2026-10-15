# RevLife

RevLife is a study companion designed to help students turn course material into approachable, repeatable review. Its goal is to make studying feel less overwhelming by bringing common study activities—reviewing concepts, checking understanding, and revisiting key ideas—into one calm, focused workspace.

## What it offers

- **Flashcard review:** Flip through concept-and-definition cards, move between cards, and track your position in the set.
- **Quizzes:** Answer multiple-choice questions, review explanations, and see a results summary.
- **Study dashboard:** A home for study activity, with sections for flashcards, quizzes, mock exams, key points, voice review, history, and profile.
- **Document-based study flow concept:** The interface accepts PDF, DOCX, TXT, and Markdown (`.md`) files and presents a processing flow. Document import is not yet connected to the study sessions; the current reviewer and quiz use bundled sample biology material.
- **Profile and account screens:** Signup, sign-in, support, and editable profile screens demonstrate the intended product experience. They are not connected to an authentication service or persistent account storage.

RevLife is currently a frontend prototype. Dashboard summaries and history are illustrative, and study progress is not saved between sessions. The project includes client-side text extraction utilities for PDF, DOCX, TXT, and Markdown, but the upload flow does not yet use their output to create study sets.

## Run locally

### Requirements

- Node.js 22 (see `.mise.toml`)
- npm

### Start the development server

```bash
npm install
npm run dev
```

Open the local URL printed by Vite in your browser.

### Build and preview

```bash
npm run build
npm run preview
```

## Technology

- React 19 and TypeScript
- Vite
- Tailwind CSS 4
- `pdfjs-dist` and `mammoth` for document text extraction utilities

## Project structure

- `src/App.tsx` — application entry component
- `src/imports/App.tsx` — RevLife screens and study interface
- `src/imports/studyFile.ts` — client-side document text extraction and study-content helpers
- `src/index.css` — global styles and Tailwind theme
- `src/main.tsx` — mounts the React application

# Screenshots

### Home

![RevLife home page](src/readmeSS/A.png)

### About and contact

![About RevLife and contact section](src/readmeSS/B.png)

### Sign in

![RevLife sign-in screen](src/readmeSS/login.png)

### Support center

![RevLife support center](src/readmeSS/Supp.png)
