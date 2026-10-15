# Job Application Tracker

A full-stack MERN application for tracking job applications. Users register and log in, then manage their own applications through a status pipeline (Wishlist, Applied, Interview, Offer, Rejected), with search, status filtering, and a dashboard of counts per status.

## Key Features

- JWT authentication: register, login, and session restore on page refresh
- Passwords hashed with bcrypt and never returned by the API
- Protected routes on the client and protected endpoints on the server
- Full CRUD for applications, always scoped to the logged-in user
- Search by company or role (debounced) and filter by status
- Dashboard counts per status
- Input validation with express-validator and a central error handler
- Postman collection covering the auth and application endpoints

## Technologies Used

- **MongoDB** with Mongoose
- **Express.js** and **Node.js**
- **React** (Vite), React Router, Axios, Context API
- **Authentication:** jsonwebtoken, bcryptjs
- **Validation:** express-validator
- **Tooling:** Code0 (VS Code extension), Postman, Git and GitHub

## Project Structure

```
job-tracker/
├── client/            React app
│   └── src/           api, context, components, pages
├── server/
│   └── src/           config, models, controllers, routes, middleware
├── postman/           Postman collection
└── AI_NOTES.md        Log of AI-assisted work and how I validated it
```

## Setup and Installation

**Prerequisites:** Node.js 20 or newer, and a MongoDB Atlas cluster (or a local MongoDB instance).

1. Clone the repository:
```bash
   git clone https://github.com/triveniko/job-tracker.git
   cd job-tracker
```

2. Set up the backend:
```bash
   cd server
   npm install
```
   Create `server/.env` from the example (`cp .env.example .env`, or `Copy-Item .env.example .env` in PowerShell) and fill in:
```
   PORT=5000
   MONGO_URI=<your MongoDB connection string, including a database name such as /jobtracker>
   JWT_SECRET=<a long random string>
   CLIENT_URL=http://localhost:5173
```
   You can generate a secret with:
```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

3. Set up the frontend:
```bash
   cd ../client
   npm install
```
   Create `client/.env` from the example (`cp .env.example .env`, or `Copy-Item .env.example .env` in PowerShell). It contains:
```
   VITE_API_URL=http://localhost:5000/api
```

If you use MongoDB Atlas, add your IP address under Network Access, otherwise the server cannot connect.

## Running the Application

Start the API (terminal 1):

```bash
cd server
npm run dev
```

You should see "MongoDB connected" and "Server running on port 5000".

Start the client (terminal 2):

```bash
cd client
npm run dev
```

Open http://localhost:5173, register an account, and add your first application.

## API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/health | No | Health check |
| POST | /api/auth/register | No | Create an account, returns a JWT |
| POST | /api/auth/login | No | Log in, returns a JWT |
| GET | /api/auth/me | Yes | Current user |
| GET | /api/applications | Yes | List your applications (`status` and `search` query params) |
| GET | /api/applications/stats | Yes | Counts per status |
| POST | /api/applications | Yes | Create an application |
| PUT | /api/applications/:id | Yes | Update an application |
| DELETE | /api/applications/:id | Yes | Delete an application |

Protected endpoints expect the header `Authorization: Bearer <token>`.

**Testing:** import `postman/job-tracker.postman_collection.json` into Postman. It has 17 requests covering registration, login, token failures, CRUD, filtering, validation errors, stats, and a wrong-owner check. Set the collection variable `baseUrl` to `http://localhost:5000/api`.

## Code0 Usage

**Confirmation: Code0 was used during the development of this project.** I used Code0 in VS Code to implement the User model and the authentication layer, to review the applications API for security issues and edge cases, to explain the repository structure, and to extract a reusable status badge component. Git operations (repository initialization, commits, and pushes) were run from the terminal in the VS Code window where Code0 is installed.

## AI Development Experience

Code0 works with a plan-then-approve flow: it reads the repository, writes a plan that lists the files it will change and the commands it may run, and only edits code after I approve that plan. I read each plan before approving it and checked that the scope matched my request, then reviewed the generated code against a checklist (password handling, token handling, ownership checks, error handling) and tested it in Postman or the browser. There was friction along the way: Code0 sometimes tried to run a command during its planning turn and was blocked, plan-file approvals were declined or the approval view closed, and its own build check once failed to run, so I verified that change myself. Each time I narrowed the prompt, asked it not to run anything before approval, and confirmed the result manually.

I also used Claude (a separate chat) to learn JWT and React concepts, plan the architecture, and as a reference for parts of the code. I typed in and adapted the applications API and the React frontend from that reference, and I used Code0 afterward to review the API. Code0 did not write those parts, and the table in `AI_NOTES.md` shows exactly who did what. Every entry in that file lists what I asked, how I validated it, and what I changed.

## Specific Tasks Where Code0 Helped

1. **User model (database integration):** I asked Code0 for a Mongoose `User` model with a unique lowercase email, a password field with `select: false`, bcryptjs hashing in a pre-save hook only when the password changes, and a `matchPassword` method. I approved a one-file plan, read the generated file against my checklist, and confirmed it loads. No changes were needed.

2. **Authentication layer (API implementation):** I asked Code0 for the async handler, central error handler, validation middleware, JWT `protect` middleware, auth controller, and auth routes, mounted in `app.js`. I validated it with 8 Postman requests (register, duplicate email, short password, login, wrong password, and `/me` with no token, a valid token, and a bad token) and confirmed in MongoDB Atlas that passwords are stored as bcrypt hashes.

3. **Security and edge-case review of the applications API (debugging and review):** I asked Code0 to review the applications controller and routes. It flagged four issues: repeated `search` query parameters can crash the endpoint with a TypeError, a `PUT` without a body can throw, an invalid `status` filter is silently ignored, and the list has no pagination. I assessed each finding against the code before acting on it. Details are in `AI_NOTES.md`.

4. **Status badge component (component development and refactoring):** I asked Code0 to extract the inline status badge from the applications page into a reusable `StatusBadge` component, limited to two files. I approved the plan and reviewed the diff. Code0's own build check did not run, so I verified the result in the browser: all five statuses still render with the same text and colors.

## Validating AI Suggestions

- **Plans and diffs reviewed before accepting:** I checked each plan's file scope and allowed commands before approving, and read the generated code before committing.
- **Verified Code0's work myself when its check failed:** for the badge refactor, Code0 reported that its build verification had not run, so I confirmed the behavior in the browser instead of trusting the change.
- **Reviewed the review:** I did not accept the applications API findings blindly. Query-string values are not guaranteed to be strings, which makes the repeated-`search` crash a real issue, while pagination is true but low priority for a project of this size.
- **Result:** I reviewed the findings and left them as documented limitations because of the time limit.
- **Checked the repository, not just my machine:** I found that the auth files were missing from `main` on GitHub because Code0 had left them uncommitted. I committed them and confirmed everything arrived by cloning the repo into a fresh folder.

## Design Decisions

- **Ownership checks in every query:** every application query filters by `user: req.user._id`, so one user can never read, update, or delete another user's data. A wrong-owner request returns 404, which I tested with a second account.
- **Allow-listed fields:** create and update only copy known fields from the request body, so a client cannot set the `user` field.
- **Same login error for both failures:** a wrong email and a wrong password return the same message, so the API does not reveal which emails are registered.
- **Password never leaves the server:** the field uses `select: false`, and login explicitly asks for it with `.select('+password')`.
- **Token handling:** the JWT is stored in `localStorage` and attached to requests by an axios interceptor. This is simple and survives refreshes. The tradeoff is exposure to XSS, and httpOnly cookies would be the safer choice in production.
- **Layered server structure:** routes, controllers, models, and middleware are separate, with a central error handler for consistent responses.
- **Client-side route protection is only UX:** the real protection is the server's `protect` middleware.

## Known Limitations

- No email verification and no password reset
- No pagination on the applications list
- No automated test suite (the API is tested with the included Postman collection)
- JWT stored in `localStorage` rather than an httpOnly cookie