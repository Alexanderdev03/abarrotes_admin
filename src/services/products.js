import { db } from '../firebase/config';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, setDoc, query, limit, startAfter, where, orderBy, startAt, endAt } from 'firebase/firestore';
import { products as localProducts, categories as localCategories } from '../data/products';

// Toggle this to switch between Local Data and Firebase
const USE_FIREBASE = true;

export const ProductService = {
  // Old method kept for compatibility if needed, but we'll use the new one
  getAllProducts: async () => {
    if (!USE_FIREBASE) {
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

  /**
   * Fetch products with server-side pagination and filtering
   * @param {Object} params
   * @param {number} params.limitPerPage - Number of items to fetch
   * @param {Object} params.lastVisible - The last document from the previous page (for pagination)
   * @param {string} params.searchTerm - Search term for name
   * @param {string} params.category - Category filter
   * @param {string} params.stockFilter - 'low', 'out', or 'all'
   */
  getProductsPaginated: async ({ limitPerPage = 10, lastVisible = null, searchTerm = '', category = '', stockFilter = 'all' }) => {
    try {
      let constraints = [];
      const productsRef = collection(db, "products");

      // 1. Base Ordering
      // Firestore requires the field used in range/inequality filters to be the first in orderBy
      if (searchTerm) {
        constraints.push(orderBy('name'));
        constraints.push(startAt(searchTerm));
        constraints.push(endAt(searchTerm + '\uf8ff'));
      } else {
        constraints.push(orderBy('createdAt', 'desc'));
      }

      // 2. Category Filter
      if (category) {
        constraints.push(where('category', '==', category));
      }

      // 3. Stock Filter
      if (stockFilter === 'low') {
        constraints.push(where('stock', '<', 5));
      } else if (stockFilter === 'out') {
        constraints.push(where('stock', '==', 0));
      }

      // 4. Pagination
      if (lastVisible) {
        constraints.push(startAfter(lastVisible));
      }

      // 5. Limit
      constraints.push(limit(limitPerPage));

      // Execute Query
      const q = query(productsRef, ...constraints);
      const snapshot = await getDocs(q);

      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        products,
        lastVisible: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === limitPerPage
      };

    } catch (error) {
      console.error("Error fetching paginated products:", error);
      throw error;
    }
  },

  getAllCategories: async () => {
    if (!USE_FIREBASE) return localCategories.map(c => ({ ...c, id: String(c.id) }));
    try {
      const querySnapshot = await getDocs(collection(db, "categories"));
      if (querySnapshot.empty) {
        // Auto-seed if empty so we have deletable documents
        console.log("Auto-seeding categories to Firestore...");
        const seededCategories = [];

        for (const cat of localCategories) {
          try {
            // Use setDoc to preserve the ID from local data (e.g., "1", "2")
            const docRef = doc(db, "categories", String(cat.id));
            await setDoc(docRef, cat);
            seededCategories.push({ ...cat, id: String(cat.id) });
          } catch (e) {
            console.error("Error seeding category:", e);
          }
        }
        return seededCategories.length > 0 ? seededCategories : localCategories.map(c => ({ ...c, id: String(c.id) }));
      }
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: String(doc.id) // IMPORTANT: Put this LAST to ensure we use the document key as the ID
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      return localCategories.map(c => ({ ...c, id: String(c.id) }));
    }
  },

  reseedCategories: async () => {
    try {
      console.log("Starting full category reseed...");
      const categoriesRef = collection(db, "categories");
      const snapshot = await getDocs(categoriesRef);

      // Delete ALL existing categories to ensure a clean slate
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      console.log("Cleared existing categories.");

      // Seed new categories from local data
      const seededCategories = [];
      for (const cat of localCategories) {
        // Force the document key to be the category ID (e.g., "1", "2")
        const docRef = doc(db, "categories", String(cat.id));
        const catData = { ...cat, id: String(cat.id) }; // Ensure ID in data matches key
        await setDoc(docRef, catData);
        seededCategories.push(catData);
      }
      console.log("Reseed complete.");
      return seededCategories;
    } catch (error) {
      console.error("Error reseeding categories:", error);
      throw error;
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
      // Use setDoc with merge: true to handle cases where the document might not exist
      // This acts as an "upsert" which fixes the "No document to update" error
      await setDoc(categoryRef, categoryData, { merge: true });
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
      console.log(`[ProductService] Updating product ${id} with data:`, productData);
      const productRef = doc(db, "products", String(id));
      await updateDoc(productRef, {
        ...productData,
        updatedAt: new Date().toISOString()
      });
      console.log(`[ProductService] Update successful for ${id}`);
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
  },

  deleteAllProducts: async () => {
    try {
      const productsRef = collection(db, "products");
      const pSnapshot = await getDocs(productsRef);

      const deletePromises = [];
      pSnapshot.docs.forEach(doc => deletePromises.push(deleteDoc(doc.ref)));

      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error("Error deleting all products:", error);
      throw error;
    }
  },

  removeDuplicateCategories: async () => {
    try {
      const categoriesRef = collection(db, "categories");
      const snapshot = await getDocs(categoriesRef);

      if (snapshot.empty) return 0;

      const categoriesByName = {};
      let deletedCount = 0;

      // Group by name
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const name = data.name ? data.name.trim().toLowerCase() : 'unnamed';
        if (!categoriesByName[name]) {
          categoriesByName[name] = [];
        }
        categoriesByName[name].push({ ref: doc.ref, id: doc.id, ...data });
      });

      // Process duplicates
      for (const name in categoriesByName) {
        const group = categoriesByName[name];
        if (group.length > 1) {
          console.log(`Found duplicates for "${name}":`, group);

          // Sort to find the "keeper". Prefer simple numeric IDs (length 1 or 2) or the one with "1"
          group.sort((a, b) => {
            const aIsSimple = a.id.length <= 2;
            const bIsSimple = b.id.length <= 2;
            if (aIsSimple && !bIsSimple) return -1; // a comes first (keep a)
            if (!aIsSimple && bIsSimple) return 1;  // b comes first (keep b)
            return a.id.localeCompare(b.id); // Default to alphanumeric sort
          });

          const keeper = group[0];
          const duplicates = group.slice(1);

          console.log(`Keeping: ${keeper.id}, Deleting: ${duplicates.map(d => d.id).join(', ')}`);

          // Delete duplicates
          const deletePromises = duplicates.map(d => deleteDoc(d.ref));
          await Promise.all(deletePromises);
          deletedCount += duplicates.length;
        }
      }

      return deletedCount;
    } catch (error) {
      console.error("Error removing duplicate categories:", error);
      throw error;
    }
  },

  checkCategoryUsage: async (categoryName, subcategoryName = null) => {
    try {
      const productsRef = collection(db, "products");
      let q;

      if (subcategoryName) {
        // Check for specific subcategory usage
        q = query(
          productsRef,
          where('category', '==', categoryName),
          where('subcategory', '==', subcategoryName),
          limit(1)
        );
      } else {
        // Check for general category usage
        q = query(
          productsRef,
          where('category', '==', categoryName),
          limit(1)
        );
      }

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error("Error checking category usage:", error);
      return false; // Assume not used in case of error to avoid blocking, or handle differently
    }
  },

  updateProductSubcategory: async (categoryName, oldSubcategoryName, newSubcategoryName) => {
    try {
      console.log(`Updating products in category "${categoryName}": "${oldSubcategoryName}" -> "${newSubcategoryName}"`);
      const productsRef = collection(db, "products");
      const q = query(
        productsRef,
        where('category', '==', categoryName),
        where('subcategory', '==', oldSubcategoryName)
      );

      const snapshot = await getDocs(q);
      console.log(`Found ${snapshot.size} products to update.`);

      const updatePromises = snapshot.docs.map(doc =>
        updateDoc(doc.ref, {
          subcategory: newSubcategoryName,
          updatedAt: new Date().toISOString()
        })
      );

      await Promise.all(updatePromises);
      return snapshot.size;
    } catch (error) {
      console.error("Error updating product subcategories:", error);
      throw error;
    }
  }
};
