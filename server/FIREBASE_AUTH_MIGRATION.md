# Firebase auth migration

## What changed

- Frontend social login now uses Firebase Authentication popup flows.
- Backend no longer starts the Spring Security OAuth redirect flow.
- Backend verifies the Firebase ID token with the Firebase Admin SDK.
- After verification, backend creates or updates the local `users` row and returns your existing JWT.

## Backend setup

1. Create a Firebase project.
2. Enable **Google** and **Facebook** in **Authentication > Sign-in method**.
3. For Facebook, add your Facebook App ID and App Secret in Firebase.
4. Download a Firebase service account JSON file.
5. Either:
   - set `app.firebase.credentials-path=/absolute/path/to/service-account.json`, or
   - set environment variable `GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json`
6. Start the Spring Boot server.

## Frontend setup

1. Copy `client/.env.example` to `client/.env`.
2. Fill in your Firebase web app values.
3. Run `npm install` in `client`.
4. Run the Vite app.

## API flow

Frontend gets Firebase ID token:

```js
const idToken = await result.user.getIdToken()
```

Frontend sends it to backend:

```http
POST /api/auth/firebase
Content-Type: application/json

{ "idToken": "..." }
```

Backend response stays the same shape as your existing login response:

```json
{
  "token": "your-app-jwt",
  "user": {
    "email": "user@example.com",
    "fullName": "User Name",
    "provider": "GOOGLE"
  }
}
```
