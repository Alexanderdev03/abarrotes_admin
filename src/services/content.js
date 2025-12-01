import { db } from '../firebase/config';
import { collection, getDocs, addDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';

export const ContentService = {
    // --- Banners ---
    getBanners: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "banners"));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error fetching banners:", error);
            return [];
        }
    },

    addBanner: async (bannerData) => {
        try {
            const docRef = await addDoc(collection(db, "banners"), bannerData);
            return { id: docRef.id, ...bannerData };
        } catch (error) {
            console.error("Error adding banner:", error);
            throw error;
        }
    },

    deleteBanner: async (id) => {
        try {
            await deleteDoc(doc(db, "banners", id));
            return true;
        } catch (error) {
            console.error("Error deleting banner:", error);
            throw error;
        }
    },

    // --- Coupons ---
    getCoupons: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "coupons"));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error fetching coupons:", error);
            return [];
        }
    },

    addCoupon: async (couponData) => {
        try {
            const docRef = await addDoc(collection(db, "coupons"), couponData);
            return { id: docRef.id, ...couponData };
        } catch (error) {
            console.error("Error adding coupon:", error);
            throw error;
        }
    },

    updateCoupon: async (id, couponData) => {
        try {
            await setDoc(doc(db, "coupons", id), couponData, { merge: true });
            return { id, ...couponData };
        } catch (error) {
            console.error("Error updating coupon:", error);
            throw error;
        }
    },

    deleteCoupon: async (id) => {
        try {
            await deleteDoc(doc(db, "coupons", id));
            return true;
        } catch (error) {
            console.error("Error deleting coupon:", error);
            throw error;
        }
    },

    // --- Combos ---
    getCombos: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "combos"));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error fetching combos:", error);
            return [];
        }
    },

    addCombo: async (comboData) => {
        try {
            const docRef = await addDoc(collection(db, "combos"), comboData);
            return { id: docRef.id, ...comboData };
        } catch (error) {
            console.error("Error adding combo:", error);
            throw error;
        }
    },

    updateCombo: async (id, comboData) => {
        try {
            await setDoc(doc(db, "combos", id), comboData, { merge: true });
            return { id, ...comboData };
        } catch (error) {
            console.error("Error updating combo:", error);
            throw error;
        }
    },

    deleteCombo: async (id) => {
        try {
            await deleteDoc(doc(db, "combos", id));
            return true;
        } catch (error) {
            console.error("Error deleting combo:", error);
            throw error;
        }
    },

    // --- Flyer ---
    getFlyer: async () => {
        try {
            const docRef = doc(db, "content", "flyer");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data();
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching flyer:", error);
            return null;
        }
    },

    saveFlyer: async (flyerData) => {
        try {
            // flyerData should contain { imageUrl: '...' }
            await setDoc(doc(db, "content", "flyer"), flyerData);
            return true;
        } catch (error) {
            console.error("Error saving flyer:", error);
            throw error;
        }
    },

    // --- Settings (General) ---
    getSettings: async () => {
        try {
            const docRef = doc(db, "settings", "general");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data();
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            return null;
        }
    },

    saveSettings: async (settingsData) => {
        try {
            await setDoc(doc(db, "settings", "general"), settingsData, { merge: true });
            return true;
        } catch (error) {
            console.error("Error saving settings:", error);
            throw error;
        }
    },

    // --- Reward Products ---
    getRewardProducts: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "reward_products"));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error fetching reward products:", error);
            return [];
        }
    },

    addRewardProduct: async (productData) => {
        try {
            const docRef = await addDoc(collection(db, "reward_products"), productData);
            return { id: docRef.id, ...productData };
        } catch (error) {
            console.error("Error adding reward product:", error);
            throw error;
        }
    },

    deleteRewardProduct: async (id) => {
        try {
            await deleteDoc(doc(db, "reward_products", id));
            return true;
        } catch (error) {
            console.error("Error deleting reward product:", error);
            throw error;
        }
    }
};
