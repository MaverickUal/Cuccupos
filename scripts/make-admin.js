// Promote a registered user to admin.  Usage: npm run make-admin -- someone@email.com
require("dotenv").config();
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.applicationDefault() });

(async () => {
  const email = process.argv[2];
  if (!email) return console.log("Usage: npm run make-admin -- <email>");
  const user = await admin.auth().getUserByEmail(email);
  await admin.firestore().collection("users").doc(user.uid).set(
    { email, name: user.displayName || email.split("@")[0], role: "admin" },
    { merge: true }
  );
  console.log(`${email} is now an admin. Sign out and back in.`);
})().catch((e) => console.error(e.message));
