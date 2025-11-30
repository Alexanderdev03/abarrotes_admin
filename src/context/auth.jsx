import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase/config';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                const appUser = {
                    uid: firebaseUser.uid,
                    name: firebaseUser.displayName,
                    email: firebaseUser.email,
                    photoURL: firebaseUser.photoURL,
                    role: 'client',
                    wallet: 0
                };

                const savedUser = localStorage.getItem('user');
                if (savedUser) {
                    try {
                        const parsed = JSON.parse(savedUser);
                        if (parsed.email === appUser.email) {
                            appUser.role = parsed.role || 'client';
                            appUser.wallet = parsed.wallet || 0;
                            appUser.coupons = parsed.coupons || [];
                        }
                    } catch (e) {
                        console.error("Error parsing saved user", e);
                    }
                }

                setUser(appUser);
                localStorage.setItem('user', JSON.stringify(appUser));
            } else {
                setUser(null);
                localStorage.removeItem('user');
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const loginWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Error logging in with Google:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    const value = {
        user,
        loginWithGoogle,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading ? children : null}
        </AuthContext.Provider>
    );
}
