import { useFirebase } from "@/composable";
import { serverTimestamp, updateDoc } from "firebase/firestore";

const {generatePath} = useFirebase();

/******* QUERY FOR UPDATE ANY DOC  *******************/
export const updateDocument = ({path = "", data = {}, preventUpdatedDate = false}) => {
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

            let setData = {
				updatedAt: serverTimestamp(),
                ...data,
			}
            if(preventUpdatedDate) {
                delete setData.updatedAt
            }

            updateDoc(pathRef, setData)
            .then(() => {
                resolve(setData);
            })
            .catch((error) => {
                reject(error);
            })
        } catch (error) {
            reject(error);
        }
    })
}