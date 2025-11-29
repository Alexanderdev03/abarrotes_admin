import { db } from '../firebase/config';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { products as localProducts, categories as localCategories } from '../data/products';

// Toggle this to switch between Local Data and Firebase
const USE_FIREBASE = true;

export const ProductService = {
  getAllProducts: async () => {
    if (!USE_FIREBASE) {
      // Simulate network delay
      return new Promise(resolve => setTimeout(() => resolve(localProducts), 500));
    }

    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: !isNaN(Number(doc.id)) ? Number(doc.id) : doc.id
      }));
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  },

  getAllCategories: async () => {
    if (!USE_FIREBASE) return localCategories;
    try {
      const querySnapshot = await getDocs(collection(db, "categories"));
      if (querySnapshot.empty) {
        // Fallback to local if empty (or seed it)
        return localCategories;
      }
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      return localCategories;
    }
  },

  addCategory: async (categoryData) => {
    try {
      const docRef = await addDoc(collection(db, "categories"), categoryData);
      return { id: docRef.id, ...categoryData };
    } catch (error) {
      console.error("Error adding category:", error);
      throw error;
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const categoryRef = doc(db, "categories", String(id));
      await updateDoc(categoryRef, categoryData);
      return { id, ...categoryData };
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      const categoryRef = doc(db, "categories", String(id));
      await deleteDoc(categoryRef);
      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },

  // CRUD Operations
  addProduct: async (productData) => {
    try {
      const productsRef = collection(db, "products");
      const docRef = await addDoc(productsRef, {
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { id: docRef.id, ...productData };
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const productRef = doc(db, "products", String(id));
      await updateDoc(productRef, {
        ...productData,
        updatedAt: new Date().toISOString()
      });
      return { id, ...productData };
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const productRef = doc(db, "products", String(id));
      await deleteDoc(productRef);
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  // Utility to upload local data to Firebase
  seedDatabase: async (onLog = console.log) => {
    onLog("Iniciando conexión con Firebase...");

    let successCount = 0;
    let errorCount = 0;

    for (const product of localProducts) {
      try {
        // Use setDoc to specify the ID, preventing duplicates and allowing updates
        const docRef = doc(db, "products", String(product.id));

        const { id, ...productData } = product;
        const dataToUpload = {
          ...productData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await setDoc(docRef, dataToUpload);
        onLog(`✅ Subido/Actualizado: ${product.name}`);
        successCount++;
      } catch (e) {
        onLog(`❌ Error al subir ${product.name}: ${e.message}`);
        errorCount++;
      }
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 100));
    }
    onLog(`🏁 Proceso finalizado. Exitosos: ${successCount}, Errores: ${errorCount}`);
  }
};
