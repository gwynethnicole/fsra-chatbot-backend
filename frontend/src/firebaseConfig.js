import { initializeApp } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc
} from "firebase/firestore";

// ✅ Corrected Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyC9XQrU79CXuj_s-5SWpP0s8knM2qyc2x8",  // Correct API Key from Firebase Console
    authDomain: "sample-d7290.firebaseapp.com",
    projectId: "sample-d7290",
    storageBucket: "sample-d7290.firebasestorage.app",  // ✅ Fixed Storage Bucket
    messagingSenderId: "755788443725",
    appId: "1:755788443725:web:cdfc6af42193a4da9d6c04",
    measurementId: "G-MCEZX0450J"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Register New User and Assign Role (Email/Password)
const registerWithEmail = async (email, password, role) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // ✅ Save user details in Firestore with assigned role
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            role: role,  // Either 'fsra' or 'carrier'
            uid: user.uid
        });

        console.log("✅ User registered successfully:", user.email);
        return user;
    } catch (error) {
        console.error("❌ Error registering user:", error.message);
        return null;
    }
};

// ✅ Login Existing User and Fetch Role
const loginWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // ✅ Fetch User Role from Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const role = userSnap.data().role;
            console.log("✅ User logged in:", user.email, "Role:", role);
            return { user, role };
        } else {
            console.warn("⚠️ No role found, defaulting to Carrier");
            return { user, role: "carrier" }; // Default role
        }
    } catch (error) {
        console.error("❌ Error logging in:", error.message);
        return null;
    }
};

// ✅ Logout User
const logout = async () => {
    try {
        await signOut(auth);
        console.log("✅ User logged out");
    } catch (error) {
        console.error("❌ Error logging out:", error.message);
    }
};

// ✅ Listen for Auth State Changes (Auto Login Check)
const authStateListener = (setUser, setRole) => {
    return onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            setUser(currentUser);
            const userRef = doc(db, "users", currentUser.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setRole(userSnap.data().role);
            } else {
                setRole("carrier"); // Default role
            }
        } else {
            setUser(null);
            setRole(null);
        }
    });
};

// ✅ Export Everything
export { auth, db, registerWithEmail, loginWithEmail, logout, authStateListener };
