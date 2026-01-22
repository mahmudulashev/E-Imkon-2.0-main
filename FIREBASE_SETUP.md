# Firebase Setup (E-Imkon)

## 1) Firebase project
- Create a Firebase project and enable:
  - Authentication -> Google
  - Firestore Database
  - Storage (optional, for files)

## 2) Add web app + env
- Create a Web App in Firebase console.
- Copy config values into `.env`:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`

## 3) Firestore security rules (starter)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }

    match /users/{userId} {
      allow read: if isSignedIn() && request.auth.uid == userId;
      allow write: if isSignedIn() && request.auth.uid == userId;
      match /progress/{courseId} {
        allow read, write: if isSignedIn() && request.auth.uid == userId;
      }
    }

    match /courses/{courseId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }

    match /lessons/{lessonId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
  }
}
```

## 4) Admin role
- In Firestore, open `users/{uid}` and set `role: "admin"` for your account.
- Admin panel route is `/admin`.

## 5) Data shape
### courses/{courseId}
```
{
  "name": "Frontend Dasturlash",
  "description": "...",
  "icon": "💻",
  "color_hex": "#fef3c7",
  "level_tag": "BEGINNER",
  "published": true
}
```

### lessons/{lessonId}
```
{
  "courseId": "frontend-101",
  "title": "HTML asoslari",
  "duration": "10 daqiqa",
  "level": "Boshlangich",
  "order_index": 1,
  "content": {
    "sections": [
      { "title": "Kirish", "content": "..." }
    ],
    "quiz": []
  }
}
```

### users/{uid}/progress/{courseId}
```
{
  "courseId": "frontend-101",
  "lastLessonId": "lesson-1",
  "completedLessonIds": ["lesson-1"]
}
```
