import { db } from '../firebase/config';
import { collection, writeBatch, doc } from 'firebase/firestore';

export const seedProducts = async (count = 500) => {
    console.log(`Starting seed of ${count} products...`);
    const batchSize = 50;
    const batches = [];

    // Data Dictionaries
    const categories = [
        { name: 'Abarrotes', subs: ['Arroz', 'Frijol', 'Aceite', 'Enlatados', 'Pastas'] },
        { name: 'Lácteos', subs: ['Leche', 'Queso', 'Yogurt', 'Crema', 'Mantequilla'] },
        { name: 'Frutas y Verduras', subs: ['Frutas', 'Verduras', 'Hierbas', 'Tubérculos'] },
        { name: 'Farmacia', subs: ['Medicamentos', 'Higiene', 'Primeros Auxilios'] },
        { name: 'Panadería', subs: ['Pan Dulce', 'Bolillo', 'Pasteles', 'Galletas'] },
        { name: 'Bebidas', subs: ['Refrescos', 'Jugos', 'Agua', 'Cerveza', 'Vinos'] }
    ];

    const adjectives = ['Fresco', 'Premium', 'Económico', 'Delicioso', 'Natural', 'Orgánico', 'Importado', 'Nacional'];

    // Helper to get random item
    const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

    let currentBatch = writeBatch(db);
    let operationCount = 0;
    let batchCount = 0;

    for (let i = 0; i < count; i++) {
        const id = `seed_${Date.now()}_${i}`;
        const productRef = doc(collection(db, "products"));

        const catObj = random(categories);
        const subCat = random(catObj.subs);
        const adj = random(adjectives);

        const product = {
            name: `${subCat} ${adj} ${i + 1}`,
            price: Math.floor(Math.random() * 500) + 10,
            originalPrice: Math.floor(Math.random() * 600) + 20,
            category: catObj.name,
            subcategory: subCat,
            stock: Math.floor(Math.random() * 100),
            description: `Este es un excelente ${subCat.toLowerCase()} de nuestra línea ${adj.toLowerCase()}. Ideal para tu despensa diaria. Calidad garantizada.`,
            image: `https://placehold.co/400x400?text=${encodeURIComponent(subCat)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isTest: true
        };

        currentBatch.set(productRef, product);
        operationCount++;

        if (operationCount === batchSize) {
            batches.push(currentBatch.commit().then(() => console.log(`Batch ${++batchCount} committed`)));
            currentBatch = writeBatch(db);
            operationCount = 0;
        }
    }

    if (operationCount > 0) {
        batches.push(currentBatch.commit().then(() => console.log(`Final batch committed`)));
    }

    try {
        await Promise.all(batches);
        console.log(`Successfully seeded ${count} products.`);
        return true;
    } catch (error) {
        console.error("Error committing batches:", error);
        throw error;
    }
};
