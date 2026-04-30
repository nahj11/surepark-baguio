import admin from "firebase-admin"

const privateKey = process.env.FIREBASE_PRIVATE_KEY

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey
        ? privateKey.replace(/\\n/g, "\n")
        : undefined, // ✅ prevents crash
    }),
    databaseURL: process.env.FIREBASE_DB_URL,
  })
}

export const db = admin.database()