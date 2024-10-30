import { useFirebase } from "@/composable";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

const {generatePath} = useFirebase();

/******* QUERY FOR INSERT TO ANY COLLECTION  *******************/
export const addDocument = ({path = "", data = {}}) => {
    return new Promise((resolve, reject) => {
        try {
            if(!path)  {
                reject(new Error("Path is required"));
                return;
            }

            const { pathRef , isCollection } = generatePath(path);

            let setData;

            const query = isCollection === true ? doc(pathRef) : pathRef;

            if(isCollection === true) {
                setData = {
                    id: query.id,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    ...data
                }
            }else{
                setData = {
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    ...data
                }
            }

            setDoc(query, setData, { merge: true })
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