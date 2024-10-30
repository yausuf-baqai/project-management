import { useFirebase } from "@/composable";
import { deleteDoc } from "firebase/firestore";

const {generatePath} = useFirebase();

/******* QUERY FOR UPDATE ANY DOC  *******************/
export const deleteDocument = (path = "") => {
    return new Promise((resolve, reject) => {
        try {
            if(!path)  {
				reject(new Error("Path is required"));
				return;
            } else if(path.split("/").length % 2 !== 0) {
				reject(new Error("Path must be a document"));
				return;
            }

            const { pathRef } = generatePath(path);

            deleteDoc(pathRef)
            .then(() => {
                resolve();
            })
            .catch((error) => {
                reject(error);
            })
        } catch (error) {
            reject(error);
        }
    })
}