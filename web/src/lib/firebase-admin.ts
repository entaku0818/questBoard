import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

let _app: App | undefined
let _db: Firestore | undefined

function getAdminApp(): App {
  if (!_app) {
    _app =
      getApps().length === 0
        ? initializeApp({
            credential: cert({
              projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
              clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
          })
        : getApps()[0]
  }
  return _app
}

export function getAdminDb(): Firestore {
  if (!_db) {
    _db = getFirestore(getAdminApp())
  }
  return _db
}
