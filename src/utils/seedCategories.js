import { db } from '../firebase/config';
import { collection, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';
import { categories as localCategories } from '../data/products';

export const seedCategories = async () => {
    console.log("Checking categories...");
    try {
        const categoriesRef = collection(db, "categories");
        const snapshot = await getDocs(categoriesRef);

        if (snapshot.size < localCategories.length) {
            console.log("Seeding categories...");
            for (const cat of localCategories) {
                // Check if exists by name to avoid duplicates if some exist
                // But since we want to restore, we can just use setDoc with a generated ID or check logic.
                // Simpler: Just add them if the collection is mostly empty.

                // Actually, let's use the name as ID or check if it exists.
                // For simplicity in this rescue mission, let's just add them.
                // Better: Check if a category with this name exists.

                const exists = snapshot.docs.some(doc => doc.data().name === cat.name);
                if (!exists) {
                    await addDoc(categoriesRef, cat);
                    console.log(`Added category: ${cat.name}`);
                } else {
                    console.log(`Category already exists: ${cat.name}`);
                }
            }
            console.log("Categories seeded successfully!");
            return true;
        } else {
            console.log("Categories already populated.");
            return false;
        }
    } catch (error) {
        console.error("Error seeding categories:", error);
        return false;
    }
};
