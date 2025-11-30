import { storage, db } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

export const StorageService = {
    /**
     * Uploads a file to Firebase Storage and saves metadata to Firestore
     * @param {File} file - The file to upload
import { storage, db } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

export const StorageService = {
    /**
     * Uploads a file to Firebase Storage and saves metadata to Firestore
     * @param {File} file - The file to upload
     * @param {string} path - The path where the file should be stored (e.g., 'products')
     * @returns {Promise<string>} - The download URL of the uploaded file
     */
    async uploadFile(file, path = 'products') {
        try {
            // Create a unique filename using timestamp
            const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const storagePath = `${path}/${filename}`;
            const storageRef = ref(storage, storagePath);

            // Create a timeout for the upload itself to avoid waiting for long retries
            const uploadPromise = uploadBytes(storageRef, file);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Upload timed out")), 15000)
            );

            const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Save metadata to Firestore
            try {
                await addDoc(collection(db, 'images'), {
                    url: downloadURL,
                    path: storagePath,
                    filename: filename,
                    originalName: file.name,
                    uploadedAt: new Date().toISOString(),
                    type: file.type,
                    size: file.size
                });
            } catch (dbError) {
                console.error("Error saving image metadata to Firestore:", dbError);
                // We don't throw here to avoid failing the upload if just the DB record fails
            }

            return downloadURL;
        } catch (error) {
            console.error("Error uploading file, falling back to Base64:", error);
            // Fallback to Base64 if Storage fails (e.g. due to billing/CORS)
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = async () => {
                    const base64String = reader.result;

                    // Save reference to 'images' collection for local image
                    try {
                        await addDoc(collection(db, 'images'), {
                            url: "Base64 Image (Stored in Product)",
                            path: "local",
                            filename: file.name,
                            originalName: file.name,
                            uploadedAt: new Date().toISOString(),
                            type: file.type,
                            size: file.size,
                            isBase64: true
                        });
                    } catch (e) {
                        console.log("Could not save image metadata", e);
                    }

                    resolve(base64String);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }
    },

    /**
     * Retrieves all images from Firestore
     * @returns {Promise<Array>} - List of image objects
     */
    async getAllImages() {
        try {
            const q = query(collection(db, 'images'), orderBy('uploadedAt', 'desc'));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error fetching images:", error);
            return [];
        }
    }
};
