import { deleteObject, getStorage, ref } from "firebase/storage";

const storage = getStorage();

export const firebaseRemove = (storageLocationURL, fileName) => {
    return new Promise((resolve, reject) => {
        try {
            const storageRef = ref(storage, storageLocationURL + fileName);
            deleteObject(storageRef).then(() => {
                resolve();
            }).catch((error) => {
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    });
}