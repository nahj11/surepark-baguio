<<<<<<< HEAD
import admin from "firebase-admin";
=======
import admin from "firebase-admin"

const privateKey = process.env.FIREBASE_PRIVATE_KEY
>>>>>>> 5a7118607394d510285464c9608b6d2849604f96

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
<<<<<<< HEAD
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DB_URL,
  });
}

export const db = admin.database();
=======
      privateKey: privateKey
        ? privateKey.replace(/\\n/g, "\n")
        : undefined, // ✅ prevents crash
    }),
    databaseURL: process.env.FIREBASE_DB_URL,
  })
}

export const db = admin.database()
>>>>>>> 5a7118607394d510285464c9608b6d2849604f96
