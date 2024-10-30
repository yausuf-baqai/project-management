import { DB_REF, GLOBAL_DB_REF } from "../mongoAuth";

export const mongodbSnapshot = async(options, cb) => {
    try {
        const {subCollection, watchFilter = {}, global = false} = options;

        if(subCollection === undefined)  {
            cb({error: new Error("subCollection is required")})
            return;
        }
        let collection = null;

        if(global) {
            collection = GLOBAL_DB_REF.value.collection(subCollection).watch(watchFilter)
        } else {
            collection = DB_REF.value.collection(subCollection).watch(watchFilter)
        }

        cb({error: null, snap: collection, data: null, type: 'inital'});

        for await (const change of collection) {
            switch (change.operationType) {
                case "insert": {
                    change.fullDocument = JSON.parse(JSON.stringify(change.fullDocument))
                    cb({error: null, snap: collection, data:change, type:'insert'});
                    break;
                }
                case "replace": {
                    change.fullDocument = JSON.parse(JSON.stringify(change.fullDocument))
                    cb({error: null, snap: collection, data:change, type:'replace'});
                    break; 
                }
                case "delete": {
                    change.documentKey = JSON.parse(JSON.stringify(change.documentKey))
                    cb({error: null, snap: collection, data:change, type:'delete'});
                    break;
                }
                case "update": {
                    change.fullDocument = JSON.parse(JSON.stringify(change.fullDocument))
                    cb({error: null, snap: collection, data:change, type:'update'});
                    break;
                }
            }
        }
    }catch(error) {
        // cb(error);
        console.error("ERROR",error, options);
    }
}