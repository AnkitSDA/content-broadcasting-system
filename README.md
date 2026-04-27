# Content Broadcasting System

Backend system where teachers upload content, principals approve it, and students access live content via public API with subject-based rotation scheduling.

## Tech Stack
- Node.js + Express
- MySQL (mysql2)
- JWT + bcrypt
- Multer (local file storage)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create .env file
```bash
copy .env.example .env
```
Edit .env with your MySQL credentials.

### 3. Database setup
Open MySQL Command Line Client:
```sql
CREATE DATABASE content_broadcasting;
USE content_broadcasting;
source C:/path/to/migrations/schema.sql
```

### 4. Start server
```bash
npm run dev
```

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | None | Register user |
| POST | /api/auth/login | None | Login, get JWT |
| GET | /api/auth/profile | JWT | Get profile |

### Content (Teacher)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/content/upload | JWT Teacher | Upload content |
| GET | /api/content/my | JWT Teacher | View own content |

### Content (Principal)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/content/all | JWT Principal | View all content |
| GET | /api/approval/pending | JWT Principal | View pending |
| PATCH | /api/approval/:id/approve | JWT Principal | Approve |
| PATCH | /api/approval/:id/reject | JWT Principal | Reject |

### Public (Students - No Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /content/live/:teacherId | Live content |
| GET | /content/live/:teacherId?subject=maths | Filter by subject |

## Upload Fields (multipart/form-data)
- title (required)
- file (required - jpg/png/gif, max 10MB)
- subject (required)
- description (optional)
- start_time (ISO format)
- end_time (ISO format)
- rotation_duration (minutes, default 5)
