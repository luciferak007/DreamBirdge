# Job Portal — Full-Stack (Spring Boot + React + MySQL)

Production-ready job board with **Job Seeker**, **Employer**, and a **single secure Admin** role.
Includes a full Admin Control Panel, an immutable audit trail (read-tracking of every
modification), JWT auth, persistent sessions, animated UI, and Docker support.

---

## ✨ Features

### Public / Seeker / Employer
- Browse & search jobs (no login required)
- Job seeker registration, login, JWT session that survives backend restarts
- Apply to jobs with cover letter (the bug from the previous version is fixed)
- Employer: post / edit / delete jobs, review applicants, change application status

### 🔐 Admin (NEW)
- **Single predefined admin** — the role is locked to ONE email
  configured in `backend/src/main/resources/application.properties`
  (`app.admin.email`, default `admin@jobportal.com`).
- Public registration **cannot create** an ADMIN account; the reserved email
  cannot be re-used; no user can ever be **promoted** to ADMIN through the API.
- Full **Admin Control Panel** at `/admin` (visible only when logged in as admin):
  - **Overview** — live dashboard with users / jobs / applications / audit counters
  - **Users** — list everyone, change role (seeker ↔ employer), delete (admin protected)
  - **Jobs** — list every job (active + inactive), activate/deactivate, delete any job
  - **Applications** — list every application, delete
  - **Audit Trail** — paginated, filterable read of every change in the system
- **AK** brand badge appears in the navbar and on every authenticated dashboard.

### 📜 Read-tracking (Audit Log)
Every write operation is recorded in `audit_logs` by `AuditService`:

| Action          | Where it’s emitted                       |
|-----------------|------------------------------------------|
| REGISTER        | `AuthService.register`                   |
| LOGIN           | `AuthService.login`                      |
| CREATE Job      | `JobService.create`                      |
| UPDATE Job      | `JobService.update`                      |
| DELETE Job      | `JobService.delete`, `AdminController`   |
| STATUS_CHANGE   | `ApplicationService.updateStatus`, admin |
| CREATE Application | `ApplicationService.apply`            |
| UPDATE / DELETE User | `AdminController`                   |

Read it any time:

```
GET /api/admin/audit?entity=Job&actor=employer@demo.com&page=0&size=50
```

---

## 🧱 Tech Stack

- **Backend:** Java 17, Spring Boot 3, Spring Security, Spring Data JPA, MySQL 8 (H2 fallback profile), JJWT, Lombok
- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Axios, React Router, react-hot-toast
- **Infra:** Dockerfiles + `docker-compose.yml`

---

## 📁 Project layout

```
fullstack-project/
├── backend/
│   └── src/main/java/com/jobportal/
│       ├── controller/   AuthController, UserController, JobController,
│       │                 ApplicationController, AdminController          ← NEW
│       ├── service/      AuthService, JobService, ApplicationService,
│       │                 AuditService                                    ← NEW
│       ├── repository/   UserRepository, JobRepository,
│       │                 ApplicationRepository, AuditLogRepository       ← NEW
│       ├── model/        User, Job, Application, Role, AuditLog          ← NEW
│       ├── dto/
│       ├── config/       SecurityConfig, DataSeeder, AdminProperties     ← NEW
│       ├── security/     JwtService, JwtAuthFilter, UserPrincipal, …
│       └── exception/
├── frontend/
│   └── src/
│       ├── pages/        Home, Jobs, JobDetail, Login, Register,
│       │                 Dashboard, MyApplications, PostJob, ManageJobs,
│       │                 JobApplicants, AdminDashboard ← NEW
│       ├── components/   Navbar (AK badge), ProtectedRoute, …
│       ├── services/     api.js (includes adminApi)                      ← UPDATED
│       └── context/      AuthContext.jsx
├── database/
│   └── schema.sql        ← includes audit_logs table
├── docker-compose.yml
└── README.md
```

---

## ▶️ Run instructions

### Option A — Docker (recommended)

```bash
docker compose up --build
```
Frontend → http://localhost:5173 · Backend → http://localhost:8080 · MySQL → localhost:3306

### Option B — Manual

**Backend (MySQL):**
```bash
cd backend
mvn spring-boot:run
```

**Backend (no MySQL needed — uses in-memory H2):**
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 👥 Demo accounts (auto-seeded on first run)

| Role       | Email                    | Password       |
|------------|--------------------------|----------------|
| **ADMIN**  | `admin@jobportal.com`    | `Admin@12345`  |
| Employer   | `employer@demo.com`      | `password123`  |
| Job Seeker | `seeker@demo.com`        | `password123`  |

> The admin account is created **once** by `DataSeeder`. You **cannot** create
> another admin via the registration API. To use a different admin email,
> change `app.admin.email` in `application.properties` **before first boot**
> (or update the row directly in the `users` table).

---

## 🔧 Where to change things

| You want to change …                       | Edit this file                                                                  |
|--------------------------------------------|---------------------------------------------------------------------------------|
| Admin email / password / display name      | `backend/src/main/resources/application.properties` (`app.admin.*`)             |
| JWT secret / token lifetime                | `backend/src/main/resources/application.properties` (`app.jwt.*`)               |
| Allowed frontend origins (CORS)            | `backend/src/main/resources/application.properties` (`app.cors.allowed-origins`)|
| MySQL connection                           | `backend/src/main/resources/application.properties` (`spring.datasource.*`)     |
| Seed users / seed jobs                     | `backend/src/main/java/com/jobportal/config/DataSeeder.java`                    |
| Audit log fields / indexes                 | `backend/src/main/java/com/jobportal/model/AuditLog.java`                       |
| Audit query / filtering                    | `backend/src/main/java/com/jobportal/repository/AuditLogRepository.java` + `AdminController.auditTrail` |
| Date / time formatting on Admin panel      | `frontend/src/pages/AdminDashboard.jsx` (`formatDate` helper)                   |
| Token storage key (`jp_token`, `jp_user`)  | `frontend/src/context/AuthContext.jsx` and `frontend/src/services/api.js`       |
| API base URL                               | `frontend/.env` → `VITE_API_URL`                                                |
| AK badge styling                           | `frontend/src/components/Navbar.jsx` and `frontend/src/pages/Dashboard.jsx`     |

---

## 🔌 API quick reference

| Method | Path                                | Auth         | Purpose                                  |
|--------|-------------------------------------|--------------|------------------------------------------|
| POST   | `/api/auth/register`                | public       | Register seeker/employer (admin blocked) |
| POST   | `/api/auth/login`                   | public       | Get JWT                                  |
| GET    | `/api/users/me`                     | bearer       | Re-validate session                      |
| GET    | `/api/jobs/public`                  | public       | Search active jobs                       |
| POST   | `/api/applications`                 | seeker       | Apply to a job                           |
| GET    | `/api/applications/mine`            | seeker       | Own applications                         |
| POST   | `/api/jobs`                         | employer     | Post job                                 |
| GET    | `/api/jobs/mine`                    | employer     | Own postings                             |
| **GET**| **`/api/admin/stats`**              | **admin**    | **Dashboard counters**                   |
| **GET**| **`/api/admin/users`**              | **admin**    | **All users**                            |
| **GET**| **`/api/admin/jobs`**               | **admin**    | **All jobs (active + inactive)**         |
| **GET**| **`/api/admin/applications`**       | **admin**    | **All applications**                     |
| **GET**| **`/api/admin/audit`**              | **admin**    | **Read audit trail (filter+paginate)**   |
| PUT    | `/api/admin/users/{id}/role`        | admin        | Change role (cannot touch ADMIN)         |
| DELETE | `/api/admin/users/{id}`             | admin        | Delete user (cannot touch ADMIN)         |
| PUT    | `/api/admin/jobs/{id}/active`       | admin        | Activate / deactivate                    |
| DELETE | `/api/admin/jobs/{id}`              | admin        | Delete any job                           |
| DELETE | `/api/admin/applications/{id}`      | admin        | Delete application                       |

---

## 🔒 Security model

1. **Authentication:** stateless JWT (HS256) via `Authorization: Bearer …`.
2. **Authorisation:** Spring Security URL rules + `@PreAuthorize("hasRole('ADMIN')")`
   on `AdminController` (defense in depth).
3. **Admin lock-down:** enforced in three places —
   - `AuthService.register` rejects `role=ADMIN` and the reserved email.
   - `AdminController.changeRole` refuses to set or unset ADMIN.
   - `DataSeeder` creates the admin only if none exists with that email.
4. **Passwords:** BCrypt, salted.
5. **Audit:** every mutation flows through `AuditService.log(...)`, indexed for
   fast filtered reads.

---

## ❓ Troubleshooting

- **“stuck logged in after server restart”** → Already fixed: `AuthContext` calls
  `GET /api/users/me` on boot; if the token is invalid the interceptor clears
  storage automatically.
- **“apply button does nothing”** → Already fixed: `ApplicationController` is
  wired up and seekers can call `POST /api/applications`.
- **CORS errors** → add your frontend origin to `app.cors.allowed-origins`.
- **Admin email already taken** → another user once registered with that email.
  Either delete that row in `users`, or change `app.admin.email` to a free address.

---

## 📄 Resume Upload (NEW)

Job seekers can attach a resume file when applying.

- **Endpoint (auth required):** `POST /api/uploads/resume` — multipart field `file`
- **Allowed formats:** PDF, DOC, DOCX
- **Max size:** 5 MB (configurable: `spring.servlet.multipart.max-file-size`)
- **Storage location:** disk, under `app.upload.dir` (default `./uploads/resumes`)
- **Public download:** `GET /api/uploads/resume/{filename}` (permitted without auth so employers can open the file directly in a new tab)

### Where to change things
| Concern | File |
|---|---|
| Storage directory | `backend/src/main/resources/application.properties` → `app.upload.dir` |
| File size / type limits | `backend/src/main/java/com/jobportal/controller/UploadController.java` |
| Frontend upload UI | `frontend/src/pages/JobDetail.jsx` (apply modal) |
| Resume link rendering | `frontend/src/pages/MyApplications.jsx`, `frontend/src/pages/JobApplicants.jsx` |
| URL helper (relative → absolute) | `frontend/src/services/api.js` → `resolveUploadUrl` |

### How it flows
1. User picks a file in the apply modal → `POST /api/uploads/resume`
2. Server saves to `./uploads/resumes/u<userId>-<ts>-<rand>.<ext>` and returns `{ url: "/api/uploads/resume/<file>" }`
3. That `url` is sent inside `POST /api/applications` as `resumeUrl`
4. "My Applications" and "Job Applicants" render it as a clickable link via `resolveUploadUrl()`

> The `uploads/` directory is created automatically on first upload. In production, mount it as a persistent volume or swap the controller for S3.
