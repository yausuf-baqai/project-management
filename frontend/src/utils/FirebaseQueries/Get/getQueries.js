import { useFirebase } from "@/composable";
import { getDoc, getDocs, onSnapshot } from "firebase/firestore";

const {generateQuery} = useFirebase();
export const getDocument = (args) => {
    return new Promise((resolve, reject) => {
        try {
            if(!args.path)  {
                reject(new Error("Path is required for query."));
                return;
            }

            const queryRef = generateQuery(args);

            if(args.path.split("/").length % 2 !== 0) {
                getDocs(queryRef)
                .then((querySnapshot) => {
                    resolve(querySnapshot);
                })
                .catch((error) => {
                    reject(error);
                })
            } else {
                getDoc(queryRef)
                .then((doc) => {
                    resolve(doc);
                })
                .catch((error) => {
                    reject(error);
                })
            }
        } catch (error) {
            reject(error);
        }
    })
};

let sd = {}; // STORE SNAPSHOT DETACH FUNCTION

export const getRawSnapshot = (args, cb) => {
    try {
        if(!args.path)  {
            cb({querySnapshot: [], error: new Error("Path is required for query.")});
            return;
        }

        const [path, snapKey] = args.path.split("~");
        const queryRef = generateQuery({...args, path});

        let sp = args.path.split("/");

        let sdKey = sp.splice(-3).join("_");
        if(snapKey) {
            sdKey += "_"+snapKey;
        }

        if(sd[`${sdKey}`] !== undefined && sd[`${sdKey}`] !== null) {
            sd[`${sdKey}`]();
            console.info("DETACH COMMMON SNAPSHOT");
        }

        sd[`${sdKey}`] = onSnapshot(queryRef, (querySnapshot) => {
            cb({querySnapshot, error: null, snapshot: sd[`${sdKey}`]});
        }, (error) => {
            console.error('error', error);
            cb({querySnapshot: [], error});
        })

    } catch (error) {
        console.error('error', error);
        cb({querySnapshot: [], error});
    }
}

export const getHandledSnapshot = (args, cb) => {
    try {
        if(!args.path)  {
            cb({querySnapshot: [], error: new Error("Path is required for query.")});
            return;
        }

        const [path, snapKey] = args.path.split("~");
        const queryRef = generateQuery({...args, path});

        let sp = args.path.split("/");

        let sdKey = sp.splice(-3).join("_");
        if(snapKey) {
            sdKey += "_"+snapKey;
        }

        if(sd[`${sdKey}`] !== undefined && sd[`${sdKey}`] !== null) {
            sd[`${sdKey}`]();
            console.info("DETACH COMMMON SNAPSHOT");
        }

        let result = [];
        sd[`${sdKey}`] = onSnapshot(queryRef, (querySnapshot) => {
            if(querySnapshot.empty) {
                cb({querySnapshot: [], error: false, snapshot: sd[`${sdKey}`]});
            } else {
                let removedTaskId = null;
                querySnapshot.docChanges().forEach((change) => {
                    if(change.type === "added") {
                        result.push(change.doc);
                    }else if(change.type === "modified") {
                        let index = result.findIndex((doc) => doc.id === change.doc.id);
                        if(index !== -1) {
                            result[index] = change.doc;
                        }
                    }else if(change.type === "removed") {
                        let index = result.findIndex((doc) => doc.id === change.doc.id);
                        removedTaskId = change.doc.id;
                        if(index !== -1) {
                            result.splice(index, 1);
                        }
                    }
                })

                cb({querySnapshot: result, error: null, removedTaskId, snapshot: sd[`${sdKey}`]});
            }
        }, (error) => {
            cb({querySnapshot: [], error});
        })
    } catch (error) {
        cb({querySnapshot: [], error});
    }
}