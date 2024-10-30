import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
// import { getPerformance } from "firebase/performance";
import firebaseConfig from './firebaseConfig'

export const firebaseApp = initializeApp(firebaseConfig)
// const auth = getAuth(firebaseApp);
// onAuthStateChanged(auth, user => {
//   // Check for user status
// });
// used for the firestore refs
const db = getFirestore(firebaseApp)
// const perf = getPerformance(firebaseApp);

// export { perf }
export default db;