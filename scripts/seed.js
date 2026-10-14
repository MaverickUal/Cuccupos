// Seeds the starter menu into Firestore.  Usage: npm run seed
require("dotenv").config();
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();

const items = [
  ["Iced Americano", 80, "Coffee", "Pure espresso with chilled water.", "☕"],
  ["Spanish Latte", 100, "Coffee", "Espresso with condensed milk.", "☕"],
  ["Caramel Macchiato", 100, "Coffee", "Espresso with vanilla syrup, and caramel drizzle", "☕"],
  ["Classic Milk Tea", 95, "Milk Tea", "Smooth and creamy milk tea.", "🧋"],
  ["Wintermelon Milk Tea", 100, "Milk Tea", "Refreshing wintermelon flavor.", "🧋"],
  ["Taro Milk Tea", 95, "Milk Tea", "Creamy taro with fresh milk and tapioca pearls", "🧋"],
  ["Mocha Frappe", 110, "Frappe", "Blended coffee and chocolate topped with whipped cream", "🥤"],
  ["Java Chip Frappe", 110, "Frappe", "Blended coffee with chocolate chips.", "🥤"],
  ["Caramel Frappe", 110, "Frappe", "Rich caramel flavor with whipped cream.", "🥤"],
  ["Matcha", 105, "Others", "Premium matcha with fresh milk.", "🍵"],
];

(async () => {
  const existing = await db.collection("menu").limit(1).get();
  if (!existing.empty) {
    console.log("Menu already has items - skipping seed.");
    return;
  }
  const batch = db.batch();
  items.forEach(([name, price, category, description, emoji]) => {
    batch.set(db.collection("menu").doc(), { name, price, category, description, emoji, imageUrl: "", available: true });
  });
  await batch.commit();
  console.log(`Seeded ${items.length} menu items.`);
})();
