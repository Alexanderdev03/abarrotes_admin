import { db } from '../firebase/config';
import { collection, getDocs, doc, setDoc, getDoc, updateDoc, deleteField } from 'firebase/firestore';

export const UserService = {
    /**
     * Syncs user data to Firestore
     */
    async syncUser(user) {
        if (!user || !user.email) return;
        try {
            const userRef = doc(db, 'users', user.email);
            // Merge true to avoid overwriting existing fields if we just want to update some
            await setDoc(userRef, {
                uid: user.uid,
                name: user.name,
                email: user.email,
                photoURL: user.photoURL,
                role: user.role || 'client',
                wallet: user.wallet || 0,
                coupons: user.coupons || [],
                phone: user.phone || '',
                lastLogin: new Date().toISOString()
            }, { merge: true });
        } catch (e) {
            console.error("Error syncing user:", e);
        }
    },

    /**
     * Obtiene los datos del perfil del usuario.
     * @param {string} email 
     */
    async getUserData(email) {
        if (!email) return null;
        try {
            const userRef = doc(db, 'users', email);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                return userSnap.data();
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error getting user data:", error);
            throw error;
        }
    },

    /**
     * Obtiene el historial de pedidos del usuario.
     * @param {string} email 
     */
    async getOrders(email) {
        if (!email) return [];
        try {
            // Intentar obtener de la subcolección 'orders' del usuario
            const userOrdersRef = collection(db, 'users', email, 'orders');
            const userOrdersSnap = await getDocs(userOrdersRef);

            if (!userOrdersSnap.empty) {
                return userOrdersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }

            // Fallback: Buscar en la colección global 'orders' filtrando por email (Legacy/Global)
            // Esto es útil si los pedidos se guardan globalmente pero no se duplicaron en el usuario antes
            return await this.getHistory(email);
        } catch (error) {
            console.error("Error getting orders:", error);
            return [];
        }
    },

    /**
     * Guarda un nuevo pedido en la subcolección de pedidos del usuario.
     * @param {string} email 
     * @param {object} order 
     */
    async addOrder(email, order) {
        if (!email) return;
        try {
            const ordersRef = collection(db, 'users', email, 'orders');
            const orderDocRef = order.id ? doc(ordersRef, String(order.id)) : doc(ordersRef);

            const orderData = {
                ...order,
                createdAt: new Date().toISOString()
            };

            await setDoc(orderDocRef, orderData);
            return orderDocRef.id;
        } catch (error) {
            console.error("Error adding order:", error);
            throw error;
        }
    },

    /**
     * Actualiza la lista de favoritos del usuario.
     * @param {string} email 
     * @param {Array} favorites 
     */
    async updateFavorites(email, favorites) {
        if (!email) return;
        try {
            const userRef = doc(db, 'users', email);
            await updateDoc(userRef, { favorites });
        } catch (error) {
            console.error("Error updating favorites:", error);
            if (error.code === 'not-found') {
                await setDoc(doc(db, 'users', email), { favorites }, { merge: true });
            }
        }
    },

    /**
     * Actualiza las listas guardadas del usuario.
     * @param {string} email 
     * @param {Array} savedLists 
     */
    async updateSavedLists(email, savedLists) {
        if (!email) return;
        try {
            const userRef = doc(db, 'users', email);
            await updateDoc(userRef, { savedLists });
        } catch (error) {
            console.error("Error updating saved lists:", error);
            if (error.code === 'not-found') {
                await setDoc(doc(db, 'users', email), { savedLists }, { merge: true });
            }
        }
    },

    /**
     * Retrieves all users from Firestore
     */
    async getAll() {
        try {
            const usersRef = collection(db, 'users');
            const snapshot = await getDocs(usersRef);
            const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Fetch all orders to aggregate stats
            const ordersRef = collection(db, 'orders');
            const ordersSnapshot = await getDocs(ordersRef);
            const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Map orders to users
            const userStats = {};
            orders.forEach(order => {
                const email = order.customer?.email || order.email;
                if (email) {
                    if (!userStats[email]) {
                        userStats[email] = { totalSpent: 0, orders: [] };
                    }
                    userStats[email].totalSpent += (order.total || 0);
                    userStats[email].orders.push(order);
                }
            });

            // Merge stats into users
            const enrichedUsers = users.map(user => {
                const stats = userStats[user.email] || { totalSpent: 0, orders: [] };
                return {
                    ...user,
                    totalSpent: stats.totalSpent,
                    orders: stats.orders
                };
            });

            // If no users in Firestore but we have orders, maybe return from orders?
            // But if we have users, we prioritize them.
            if (enrichedUsers.length === 0 && orders.length > 0) {
                return this.getAllFromOrders();
            }

            return enrichedUsers;
        } catch (e) {
            console.error("Error getting users:", e);
            return [];
        }
    },

    /**
     * Fallback: Retrieves customers from orders (Legacy)
     */
    async getAllFromOrders() {
        try {
            const ordersRef = collection(db, 'orders');
            const snapshot = await getDocs(ordersRef);
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const customersMap = {};

            orders.forEach(order => {
                const email = order.customer?.email || order.email || 'unknown';
                if (!customersMap[email]) {
                    customersMap[email] = {
                        id: order.userId || email,
                        name: order.customer?.name || order.name || 'Cliente',
                        email: email,
                        phone: order.customer?.phone || order.phone || '',
                        orders: [],
                        totalSpent: 0,
                        lastOrderDate: null,
                        wallet: 0, // Default
                        coupons: [] // Default
                    };
                }

                customersMap[email].orders.push(order);
                customersMap[email].totalSpent += (order.total || 0);

                const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
                if (!customersMap[email].lastOrderDate || orderDate > customersMap[email].lastOrderDate) {
                    customersMap[email].lastOrderDate = orderDate;
                }
            });

            return Object.values(customersMap);
        } catch (e) {
            console.error("Error getting customers from orders:", e);
            return [];
        }
    },

    async getHistory(email) {
        try {
            const ordersRef = collection(db, 'orders');
            const snapshot = await getDocs(ordersRef);
            const orders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
            }));

            return orders.filter(o => (o.customer?.email === email || o.email === email));
        } catch (e) {
            console.error("Error getting customer history: ", e);
            return [];
        }
    },

    // --- Admin Actions ---

    async updateWallet(email, newBalance) {
        try {
            const userRef = doc(db, 'users', email);
            await updateDoc(userRef, {
                wallet: Number(newBalance)
            });
            return true;
        } catch (e) {
            console.error("Error updating wallet:", e);
            throw e;
        }
    },

    async removeCoupon(email, couponCode) {
        try {
            const userRef = doc(db, 'users', email);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                const updatedCoupons = (userData.coupons || []).filter(c => c.code !== couponCode);
                await updateDoc(userRef, {
                    coupons: updatedCoupons
                });
                return true;
            }
            return false;
        } catch (e) {
            console.error("Error removing coupon:", e);
            throw e;
        }
    }
};
