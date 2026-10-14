import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged, signOut, signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

async function ensureProfile(user, name) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  const profile = {
    name: name || user.displayName || user.email.split("@")[0],
    email: user.email,
    role: "customer",
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, profile);
  return { ...profile, createdAt: null };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(auth, async (u) => {
        setUser(u);
        setProfile(u ? await ensureProfile(u) : null);
        setLoading(false);
      }),
    []
  );

  const value = {
    user, profile, loading,
    isAdmin: profile?.role === "admin",
    loginEmail: (email, pw) => signInWithEmailAndPassword(auth, email, pw),
    loginGoogle: () => signInWithPopup(auth, googleProvider),
    register: async (name, email, pw) => {
      const cred = await createUserWithEmailAndPassword(auth, email, pw);
      await updateProfile(cred.user, { displayName: name });
      setProfile(await ensureProfile(cred.user, name));
    },
    logout: () => signOut(auth),
  };
  return <Ctx.Provider value={value}>{loading ? <div className="grid h-screen place-items-center bg-background font-bold text-primary">Loading…</div> : children}</Ctx.Provider>;
}
