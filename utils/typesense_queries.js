// const client = require("../Config/typesense");


/******* QUERY FOR UPDATE TO ANY DOC  *******************/
// exports.updateDocument = (body) => {
//     return new  Promise((resolve, reject) => {
//         try {
//             let keys = ["collectionName", "docId", "data"];
//             let bodyKeys = Object.keys(body);

//             keys.forEach((key) => {
//                 if(!bodyKeys.includes(key)) {
//                     reject(`${key} is required`)
//                     return;
//                 }
//             })

//             const {collectionName, docId, data} = body;

//             if(typeof collectionName !== "string")  {
//                 reject(new Error("collectionName must be a string"));
//                 return;
//             } else if(collectionName === "")  {
//               reject(new Error("collectionName is required"));
//               return;
//             }

//             if(typeof docId !== "string")  {
//                 reject(new Error("docId must be a string"));
//                 return;
//             } else if(docId === "")  {
//               reject(new Error("docId is required"));
//               return;
//             }

//             if(typeof data !== "object") {
//                 reject(new Error("data must be an object"));
//                 return;
//             } else if(!Object.keys(data).length) {
//                 reject(new Error("data cannot be empty"));
//                 return;
//             }

//             client.collections(collectionName).documents(docId).update(data)
//             .then((response) => {
//                 resolve(response);
//             })
//             .catch((error) => {
//                 reject(error);
//             })
//         } catch (error) {
//             reject(error);
//         }
//     })
// }

/******* QUERIES TO GET ANY DOC  *******************/

// Remove Code
// exports.getCollectionData = (body) => {
//     return new Promise((resolve, reject) => {
//         try {
//             let keys = ["collectionName"];
//             let bodyKeys = Object.keys(body);

//             keys.forEach((key) => {
//                 if(!bodyKeys.includes(key)) {
//                     reject(`${key} is required`)
//                     return;
//                 }
//             })
//             const {collectionName, docId, search} = body;

//             if(typeof collectionName !== "string")  {
//                 reject(new Error("collectionName must be a string"));
//                 return;
//             } else if(collectionName === "")  {
//               reject(new Error("collectionName is required"));
//               return;
//             }

//             if(docId && typeof docId !== "string")  {
//                 reject(new Error("docId must be a string"));
//                 return;
//             } else if(docId && docId === "")  {
//               reject(new Error("docId is required"));
//               return;
//             }

//             if(search && typeof search !== "object")  {
//                 reject(new Error("search must be a object"));
//                 return;
//             } else if(search && !Object.keys(search).length)  {
//               reject(new Error("search is required"));
//               return;
//             }

//             let query = client.collections(collectionName)
//             if(docId) {
//                 query = query.documents(docId);
//             } else {
//                 query = query.documents();
//             }

//             if(search) {
//                 query.search(search)
//                 .then((response) => {
//                     resolve(response);
//                 })
//                 .catch((error) => {
//                     reject(error);
//                 })
//             } else {
//                 query.retrieve()
//                 .then((response) => {
//                     resolve(response);
//                 })
//                 .catch((error) => {
//                     reject(error);
//                 })
//             }

//         } catch (error) {
//             reject(error);
//         }
//     })
// }