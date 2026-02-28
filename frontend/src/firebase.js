import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDgs8RhOATLQY5I-90GpH7idFFmhlHfyLA",
    authDomain: "cyrus-732cc.firebaseapp.com",
    projectId: "cyrus-732cc",
    storageBucket: "cyrus-732cc.firebasestorage.app",
    messagingSenderId: "1098488899748",
    appId: "1:1098488899748:web:617a83b687cbf749ef5e31",
    measurementId: "G-Q5BG8YL7ZW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
