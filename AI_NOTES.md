# AI Notes

A running log of how I used AI tools while building this project, what I checked, and what I changed. Newest entries go at the bottom.

## Tools used

- **Code0 (CodeZero extension in VS Code):** implementation, code review, debugging, and refactoring inside the editor. Git commands are run from the VS Code terminal.
- **Claude (separate chat):** concept learning (JWT, React), project planning, and explaining errors. I use it for understanding and planning, not as a replacement for Code0 in the editor.

## Validation checklist I apply to every AI suggestion

1. Do I understand every line?
2. Does it run? (Postman, browser, or terminal)
3. Edge cases: empty input, wrong types, missing or expired token, duplicate email, another user's record id
4. Security: no hardcoded secrets, passwords hashed and never returned, queries scoped to the logged-in user
5. Does it fit the project structure (routes, controllers, models, middleware)?
6. Are the packages and functions real and current?

---

## Entry 1: Project setup and server scaffold

- **Date:** 2026-10-15
- **Task:** Create the repo, folder structure, and Express server with a MongoDB connection.
- **Tool:** [Claude for the plan and reference code / Code0 / both. Say which parts came from where.]
- **How I validated:** Ran `npm run dev`, confirmed "MongoDB connected" and the server started on port 5000, checked `/api/health`, ran `git status` to confirm `.env` is ignored before the first commit.
- **Issues I hit:** The folder-creation command from my guide used Bash syntax (`mkdir -p` with braces) and failed in PowerShell on Windows. I switched to PowerShell's `New-Item -ItemType Directory`.
- **What I learned:** `dotenv` has to load before anything reads `process.env`, and the server should only start listening after the DB connects.

## Entry 2: Asking Code0 to explain the repo

- **Date:** 2026-10-15
- **Task:** Asked Code0 to explain the structure of the repository.
- **What it said:** It described the committed files (a README with only the title, and a `.gitignore` excluding dependencies, env files, build output, and logs) and correctly said there were no source files yet.
- **How I validated:** Compared its answer to my actual repo. It matched.
- **Changes I made:** None.

## Entry 3: User model with Code0 (plan and approval workflow)

- **Date:** 2026-10-15
- **Task:** Create `server/src/models/User.js` using Mongoose: name, unique lowercase email, password (min 6 chars, `select: false`), bcryptjs hashing in a pre-save hook only when the password is modified, a `matchPassword` method, timestamps, CommonJS.
- **Prompt (short):** [paste your actual prompt, or keep as is if you used the wording above]
- **How Code0 worked:** It inspected the repo first, noticed I already use CommonJS, Mongoose, and bcryptjs, then had to write a plan and get my approval before changing any code.
- **Workflow problems I solved:**
  - Code0 tried to run a command during its planning turn and was blocked by its own rule that commands can't run until a plan is approved.
  - Writing the plan file needed my approval, and the first attempt was declined. I re-prompted with a tighter scope (one file, one read-only verification command) and approved the file write.
  - The approval screen kept closing when opened from the task list. I opened it a different way [say what actually worked] and approved the plan.
- **How I validated:** Read the plan before approving (scope: only `User.js`; the only allowed command was `node -e "require('./src/models/User')"`). After the code was generated I checked [fill in after you review the diff]: password excluded from queries, hashing only when modified, `await` on bcrypt calls, unique and lowercase email, the model export.
- **What was wrong / what I changed:** Nothing needed changing. The generated model matched my checklist
- **What I learned:** [one line in your own words]

<!-- Copy the template below for each new entry -->

## Entry N: <short title>

- **Date:**
- **Task:**
- **Prompt (short):**
- **What it suggested:**
- **How I validated:**
- **What was wrong / what I changed:**
- **What I learned:**