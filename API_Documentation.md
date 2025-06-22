# AgriDoc API Documentation

This document describes the available API endpoints for the AgriDoc project, including sample requests and responses.

---

## Authentication

### `POST /api/auth/login`
- **Description:** Log in a user (Google OAuth or local).
- **Request Body (JSON):**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Sample Response:**
  ```json
  {
    "user": {
      "id": "123456",
      "name": "user",
      "email": "user@example.com"
    },
    "message": "Login successful"
  }
  ```

---

### `GET /api/auth/logout`
- **Description:** Log out the current user.
- **Sample Request:**  
  `GET /api/auth/logout`
- **Sample Response:**
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

---

### `GET /api/auth/me`
- **Description:** Get the currently authenticated user's info.
- **Sample Request:**  
  `GET /api/auth/me`
- **Sample Response:**
  ```json
  {
    "user": {
      "id": "123456",
      "name": "user",
      "email": "user@example.com"
    }
  }
  ```

---

## Diagnosis

### `POST /api/diagnose`
- **Description:** Diagnose a plant disease from an uploaded image.
- **Request:**  
  `multipart/form-data` with field `image` (file)
- **Sample cURL:**
  ```bash
  curl -X POST -F "image=@/path/to/leaf.jpg" http://localhost:5000/api/diagnose
  ```
- **Sample Response:**
  ```json
  {
    "disease": "Corn_(maize)___Common_rust_",
    "confidence": 0.92,
    "recommendation": "Use fungicide X and remove affected leaves."
  }
  ```

---

## Chat/AI Assistant

### `POST /api/chat`
- **Description:** Ask a question to the AgriDoc AI assistant.
- **Request Body (JSON):**
  ```json
  {
    "message": "How do I treat powdery mildew?"
  }
  ```
- **Sample Response:**
  ```json
  {
    "answer": "To treat powdery mildew, remove affected leaves and apply a fungicide recommended for your crop."
  }
  ```

---

## User Profile

### `GET /api/profile`
- **Description:** Get the current user's profile.
- **Sample Request:**  
  `GET /api/profile`
- **Sample Response:**
  ```json
  {
    "id": "123456",
    "name": "user",
    "email": "user@example.com",
    "history": []
  }
  ```

---

### `PUT /api/profile`
- **Description:** Update the current user's profile.
- **Request Body (JSON):**
  ```json
  {
    "name": "user"
  }
  ```
- **Sample Response:**
  ```json
  {
    "id": "123456",
    "name": "user",
    "email": "user@example.com"
  }
  ```

---

## Diagnosis History

### `GET /api/history`
- **Description:** Get the authenticated user's diagnosis history.
- **Sample Request:**  
  `GET /api/history`
- **Sample Response:**
  ```json
  [
    {
      "id": "diag1",
      "disease": "Grape___Esca_(Black_Measles)",
      "date": "2024-06-21T12:34:56Z",
      "imageUrl": "/uploads/leaf1.jpg"
    },
    {
      "id": "diag2",
      "disease": "Powdery Mildew",
      "date": "2024-06-20T10:20:30Z",
      "imageUrl": "/uploads/leaf2.jpg"
    }
  ]
  ```

---

## Error Responses

- `401 Unauthorized` – Not logged in or session expired.
- `403 Forbidden` – Not allowed.
- `404 Not Found` – Resource does not exist.
- `500 Internal Server Error` – Server error.

**Sample Error Response:**
```json
{
  "error": "Unauthorized"
}
```

---

## Authentication

Most endpoints require authentication via session cookie.

---

## Example Usage

**Diagnose a plant:**
```bash
curl -X POST -F "image=@/path/to/leaf.jpg" http://localhost:5000/api/diagnose
```

**Ask the AI:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"message":"How to treat blight?"}' http://localhost:5000/api/chat
```
*For more details, see the source code.* 