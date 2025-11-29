import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, getDocs, doc, updateDoc } from 'firebase/firestore';

export const OrderService = {
    /**
     * Creates a new order in Firebase Firestore
     * @param {Object} orderData - The order data to save
     * @returns {Promise<string>} - The ID of the created order
     */
    async createOrder(orderData) {
        try {
            const docRef = await addDoc(collection(db, 'orders'), {
                ...orderData,
                createdAt: serverTimestamp(),
                status: 'pending' // Default status
            });
            console.log("Order written with ID: ", docRef.id);
            return docRef.id;
        } catch (e) {
            console.error("Error adding document: ", e);
            throw e;
        }
    },

    /**
     * Retrieves all orders from Firebase Firestore
     * @returns {Promise<Array>} - List of orders
     */
    async getOrders() {
        try {
            const querySnapshot = await getDocs(collection(db, 'orders'));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Convert Firestore Timestamp to Date object if needed, or ISO string
                date: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
            }));
        } catch (e) {
            console.error("Error getting documents: ", e);
            return [];
        }
    },

    /**
     * Updates the status of an order in Firebase
     * @param {string} orderId - The ID of the order to update
     * @param {string} status - The new status
     * @returns {Promise<boolean>} - True if successful
     */
    async updateStatus(orderId, status) {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { status });
            return true;
        } catch (e) {
            console.error("Error updating status: ", e);
            return false;
        }
    }
};
