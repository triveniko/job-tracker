# AI Notes

A running log of how I used AI tools while building the Job Application Tracker: what I asked, how I validated the output, and what I changed. All dates are 2026-10-15 unless stated otherwise.

## Tools used

- **Code0 (CodeZero extension in VS Code):** implementation tasks (plan, approve, run, review diff), a security and edge-case review, and a small refactor. Git commands were run from the integrated terminal in the VS Code window where Code0 is installed.
- **Claude (separate chat):** learning concepts (JWT, React), planning the architecture, explaining errors, and providing reference code that I typed in and adapted. I do not present this as Code0's work.

## Who wrote what

| Area | Written by | Code0's role |
|---|---|---|
| Server scaffold (`app.js`, `server.js`, `config/db.js`) | Me, from Claude's plan and reference code | Explained the repo structure |
| `User` model | Code0 (I approved the plan and reviewed the file) | Implementation |
| Auth layer (middleware, controller, routes) | Code0 (I approved the plan) | Implementation |
| Applications API (model, controller, routes) | Me, typed from Claude's reference code | Reviewed it and reported issues |
| React frontend (auth, routes, applications page) | Me, from Claude's reference code | None |
| `StatusBadge` component | Code0 (I approved the plan and reviewed the diff) | Implementation and refactor |
| Postman collection | Me | None |

## Validation checklist I apply to every AI suggestion

1. Do I understand every line?
2. Does it run? (Postman, browser, or terminal)
3. Edge cases: empty input, wrong types, missing or expired token, duplicate email, another user's record id
4. Security: no hardcoded secrets, passwords hashed and never returned, queries scoped to the logged-in user
5. Does it fit the project structure (routes, controllers, models, middleware)?
6. Are the packages and functions real and current?

---

## Entry 1: Project setup and server scaffold

- **Task:** Create the repo, folder structure, and an Express server with a MongoDB connection.
- **Tool:** Claude for the plan and reference code; I created the files myself. No Code0 code generation here.
- **How I validated:** Ran `npm run dev` and confirmed "MongoDB connected" and "Server running on port 5000". Checked `/api/health`. Ran `git status` before the first commit to confirm `.env` was ignored. Generated `JWT_SECRET` with Node's `crypto` module instead of inventing a short string.
- **Issues I hit:**
  - The folder-creation command I was given used Bash syntax (`mkdir -p` with braces) and failed in PowerShell. I switched to `New-Item -ItemType Directory`.
  - `npm run dev` failed with `ENOENT package.json` because I ran it from the project root instead of `server/`.
- **What I learned:** `dotenv` must load before anything reads `process.env`, and the server should only start listening after the database connects.

## Entry 2: Asking Code0 to explain the repo

- **Task:** Asked Code0 to explain the structure of the repository.
- **What it said:** It described the committed files (a README with only the title and a `.gitignore`) and correctly noted there were no source files yet.
- **How I validated:** Compared its answer with my actual repo. It matched.
- **Changes I made:** None.

## Entry 3: User model with Code0

- **Task:** Create `server/src/models/User.js` with Mongoose: name, unique lowercase email, password (min 6 characters, `select: false`), bcryptjs hashing in a pre-save hook only when the password is modified, a `matchPassword` method, timestamps, CommonJS.
- **How Code0 worked:** It read the repo first and noticed I already used CommonJS, Mongoose, and bcryptjs. It then had to write a plan and get my approval before changing code.
- **Workflow problems I solved:**
  - Code0 tried to run a command during its planning turn and was blocked by its own rule that no commands run until a plan is approved.
  - Writing the plan file needed my approval, and the first attempt was declined. I re-prompted with a tighter scope (one file, one read-only verification command) and approved the file write.
  - The approval view kept closing when opened from the task list. After a retry it stayed open in the Tasks panel and I approved the plan from there.
- **How I validated:** I read the plan before approving it (scope: only `User.js`; the only allowed command was `node -e "require('./src/models/User')"`). After generation I read the file against my checklist: password has `select: false`, hashing only runs when the password is modified, `bcrypt.hash` is awaited, `matchPassword` returns the `bcrypt.compare` result, email is unique and lowercase, and the model is exported. I also confirmed the model loads without errors.
- **What was wrong / what I changed:** Nothing needed changing.
- **What I learned:** Because the password field uses `select: false`, the login query must use `.select('+password')`, otherwise `matchPassword` would compare against `undefined`.
- **Git note:** The work was committed on a branch Code0 created (`code0/...`). I had two commits with the same message here, one from Code0's flow and one from mine. I left the history as it was.

## Entry 4: Authentication layer with Code0

- **Task:** Create `asyncHandler`, a central error handler (`notFound` plus `errorHandler` mapping duplicate key to 409 and validation or cast errors to 400), `validate.js` using express-validator, an auth middleware (`protect`) that verifies the Bearer JWT and loads the user, an auth controller (register, login, getMe), auth routes, and mount them in `app.js`.
- **How Code0 worked:** Same plan-then-approve flow as Entry 3. This time the approval prompt for the plan file appeared as a dialog and I allowed it, then approved the plan. Before starting, VS Code asked what to do with an uncommitted change (my `AI_NOTES.md` edit) because Code0 was switching to a new branch. I chose to commit it to the branch it belonged to.
- **How I validated:**
  - Ran 8 Postman requests, and all passed: register (201, no password in the response), duplicate email (409), short password (400), login (200), wrong password (401), `/me` without a token (401), `/me` with a valid token (200), `/me` with a garbled token (401).
  - Checked in MongoDB Atlas that stored passwords are bcrypt hashes (`$2b$10$...`), not plain text.
  - Opened `authController.js` and confirmed the token is signed with `process.env.JWT_SECRET` and the password is stripped before the user object is returned.
- **What was wrong / what I changed:** No functional problems in the code. I did find a process problem: when I checked GitHub, the `controllers/`, `middleware/` and `routes/` folders were missing from `main`. Code0 had written the files as uncommitted work and nothing had been committed. I committed them, then cloned the repo into a temporary folder to confirm everything was on GitHub before deleting the temporary copy.
- **What I learned:** Check GitHub (or a fresh clone), not just the local folder. "Works on my machine" does not mean the work is in the repository.

## Entry 5: Applications API

- **Task:** Application model, controller (list with `status` and `search` filters, stats, create, update, delete) and routes, all protected and scoped to the logged-in user.
- **Tool:** Written by me, typed in from Claude's reference code. Code0 was used afterward to review it (Entry 6).
- **Design points I can explain:**
  - Every query includes `user: req.user._id`, so one user can never read, edit or delete another user's record. A wrong-owner request gets a 404.
  - A `pickFields` allow-list stops clients from setting the `user` field or any other field through the request body.
  - `/stats` is declared before `/:id`, otherwise Express would treat "stats" as an id.
  - The search text is regex-escaped before it is used in a query.
- **Bug I hit:** The server crashed on startup with `MODULE_NOT_FOUND` at `applicationRoutes.js:3:11`. I read the stack trace, which pointed at the controller `require` on line 3. The cause was my own typo in the filename (`applicaationController.js`). I renamed the file and the server started. This was a human typo, not an AI suggestion.
- **How I validated:** Postman, all passing. Create (201), list, filter by status and by search, update, delete (200, then 404 on a second delete), request with no token (401), create without a company (400), wrong owner (a second user trying to update the first user's record returned 404), and stats (200). Together with the 8 auth requests, that is 17 passing requests. I also noticed that sending `PUT /applications/<id>` with a literal placeholder returned a 400 instead of crashing, which confirmed the central error handler converts Mongoose cast errors correctly.
- **What I learned:** Authorization lives in the query, not just in the middleware. Filtering by owner and returning 404 means other users' records look like they don't exist.

## Entry 6: Code0 review of the applications API

- **Task:** Asked Code0 to review `applicationController.js` and `applicationRoutes.js` for security issues, missing ownership checks, and edge cases.
- **What it found:**
  1. Repeated `search` query parameters (`?search=a&search=b`) turn `req.query.search` into an array, and `.replace()` on it throws a `TypeError`, which returns a 500.
  2. `PUT /:id` with no request body can throw if `req.body` is undefined, and an empty update does nothing useful.
  3. An invalid `status` filter (for example `?status=Banana`) is silently ignored and returns the unfiltered list instead of a validation error.
  4. The list endpoint has no pagination or result limit.
- **How I validated:** I assessed each finding against the code. Finding 1 is real because query-string values are not guaranteed to be strings. Finding 2 depends on the Express version. Finding 3 is a design weakness that a 400 would improve. Finding 4 is true but low priority for a project of this size.
- **Status of the findings (keep ONE of these two lines and delete the other):**
  - **Not fixed yet:** I reviewed the findings and left them as documented limitations because of the time limit.
- **What I learned:** Query-string values can be arrays or objects, so they must be type-checked before use.

## Entry 7: React frontend

- **Task:** Vite and React app with login and register pages, an auth context with an axios interceptor that attaches the JWT, a protected route, and the applications page (list, add, edit, delete, search with debounce, status filter, and a stats bar).
- **Tool:** Written by me from Claude's reference code. I did not use Code0 to generate it.
- **How I validated:** Ran both servers and used the app in the browser: registered, logged in, added and edited applications, searched, filtered by status, and deleted. The stats counts matched the list. I took a screenshot of the working app. I also checked that a refresh keeps me logged in, because the context restores the session from the stored token through `/auth/me`.
- **Design points I can explain:**
  - The axios interceptor adds the token to every request, so no page has to remember to.
  - The `loading` flag in the auth context stops a logged-in user from being bounced to `/login` while `/auth/me` is still pending.
  - Search is debounced by 300 ms and the effect cleans up its timer, so typing does not fire a request per keystroke.
  - `isSafeLink` only renders `http(s)` links, which blocks `javascript:` URLs.
  - Client-side protected routes are only UX. The real protection is the server's `protect` middleware.
- **Known tradeoff:** The JWT is kept in `localStorage`, which is simple but exposed to XSS. httpOnly cookies would be safer in production.

## Entry 8: StatusBadge component with Code0

- **Task:** Extract the status badge (a span with class `badge` plus the lowercase status) from `Applications.jsx` into `client/src/components/StatusBadge.jsx` and use it in the page. Only those two files may change.
- **How Code0 worked:** The first attempt stalled: Code0 tried to run a command during planning, was blocked, and the plan-file write was declined. I re-prompted with an explicit instruction not to run anything before approval and to submit the plan. I then read the plan (scope: two files; allowed command: `npm run build`) and approved it.
- **How I validated:**
  - Code0 reported that its own build check did not run (a setup refresh had errors before `npm` executed), so its change was unverified by Code0. I verified it myself in the browser: all five status labels still render with the same text and colors.
  - The commit touched exactly two files (`StatusBadge.jsx` created, `Applications.jsx` modified).
- **What was wrong / what I changed:** Nothing needed changing in the code.
- **Git note:** `git push` failed with "no upstream branch" because Code0 had committed on its own branch (`code0/...-status-badge`). The fix was to push with `git push -u origin <branch>`, then merge into `main` and push `main`.
- **What I learned:** An AI tool's verification step can fail silently, so I confirm the result myself.

---

## Git workflow

- Code0 creates a new `code0/...` branch for each task. After each task I push that branch and merge it into `main`, so `main` always contains the finished work. The branches are kept, which preserves the history of each Code0 task.
- Commits are small and use conventional prefixes (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`).
- `.env` files and `node_modules` are git-ignored. `.env.example` files document the required variables. Code0's local task folder (`.code0/`) is also ignored.

## Tooling issues and how I handled them

- **Code0 plan approval:** several times the plan-file write was declined or the approval view closed. Re-prompting with a narrow scope and an explicit "run nothing before approval" instruction fixed it.
- **Code0 disconnected:** at one point the panel showed that its tools were not connected. I reloaded the VS Code window and continued with other work in the meantime.
- **Stale tasks:** old Code0 tasks stayed listed as "Running" after their work was finished and committed. I did not re-run them, and I checked `git status` and `git log` to confirm nothing had changed.
- **Postman:** the web version failed with "Cloud Agent Error: couldn't resolve host" for `localhost`. I switched to the Postman Desktop Agent, which can reach my local server.