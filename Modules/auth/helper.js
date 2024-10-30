const { default: mongoose } = require("mongoose");

function replaceKey(value, updateFunction) {
    let tmp = {};

    if(updateFunction) {
        tmp = updateFunction(value);
    } else {
        Object.keys(value).forEach(key =>{
            if(Array.isArray(value[key])) {
                tmp[key] = value[key].map((val) => {
                    return new mongoose.Types.ObjectId(val);
                });
            } else {
                tmp[key] = new mongoose.Types.ObjectId(value[key]);
            }
        })
    }

    return tmp;
}

exports.replaceObjectKey = (value, searchKey, updateFunction = undefined) => {
    let tmp = {};

    if(!searchKey?.length) return value;
    if(typeof value === "object" && !Array.isArray(value)) {
        for (const key in value) {
            if (Object.hasOwnProperty.call(value, key)) {
                const element = value[key];

                if(key === searchKey) {
                    tmp = {
                        ...tmp,
                        ...replaceKey(element, updateFunction)
                    }

                    delete tmp[key]
                } else {
                    tmp = {
                        ...tmp,
                        [key]: exports.replaceObjectKey(element, searchKey, updateFunction)
                    }
                }
            }
        }
    } else if(Array.isArray(value)) {
        tmp = value.map((x) => {
            x = exports.replaceObjectKey(x, searchKey, updateFunction);

            return x;
        })
    } else {
        tmp = value;
    }

    return tmp;
}