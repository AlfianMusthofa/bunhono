# BunHono API Documentation

## Description

Backend API for SaaS Event Management Platform. This API handles authentication, event management, event participant, and certification generation.

## Tech Stack

- Bun
- Hono
- Sequelize ORM
- My SQL
- JWT Authentication
- [Cloudinary](https://cloudinary.com/)

## Installation

Clone this repository:

```bash
https://github.com/AlfianMusthofa/bunhono.git
```

Install dependencies:

```bash
bun install
```

Setup environment:

```bash
cp .env.example .env
```

Start server:

```bash
npm run dev
```

## Authentication

### Register User

POST `/auth/register`

Request:

```json
{
  "name": "xfxalfn",
  "email": "xfxalfn@gmail.com",
  "password": "xfxalfn"
}
```

Response:

```json
{
  "message": "User registered successfully"
}
```

### Login

POST `/auth/login`

request:

```json
{
  "email": "xfxalfn@gmail.com",
  "password": "xfxalfn"
}
```

Response:

```json
{
  "message": "Login Success",
  "user": {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image
  }
  accessToken
  refreshToken
}
```

## Events

### Get All Events

GET `/events`

query:
`?page=1&limit=10&search=work`

Response:

```json
{
  "data": [
    {
      "id": 1,
      "title": "title",
      "location": "Jakarta",
      "startAt": "9.30",
      "endAt": 1
    }
  ]
}
```
