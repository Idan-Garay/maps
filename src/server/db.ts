import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { firebaseConfig } from './firebase.config'

// Initialize Cloud Firestore and get a reference to the service
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export { db }
