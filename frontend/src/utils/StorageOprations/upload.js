import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
const storage = getStorage();


export const firebaseUpload = (file, storageLocationURL, fileName) => {
    return new Promise((resolve, reject) => {
        try {
            const storageRef = ref(storage, storageLocationURL + fileName);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed', 
                () => {
                    // Observe state change events such as progress, pause, and resume
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    // const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                }, 
                (error) => {
                    reject(error);
                }, 
                () => {
                    // Handle successful uploads on complete
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        resolve(downloadURL);
                    })
                    .catch((error) => {
                            reject(error);
                    });
                }
            );
        } catch (error) {
            reject(error);
        }
    });
};