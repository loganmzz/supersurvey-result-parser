function stringify(object) {
    return JSON.stringify(object, (key, value) => {
        if (typeof(value) !== 'object') {
            //console.log(`key: ${key}  /  type: ${typeof(value)}`);
            return value;
        }
        if (value instanceof Map) {
            //console.log(`key: ${key}  /  type: Map`);
            return Array
                    .from(value)
                    .reduce((obj, [k, v]) => {
                        obj[k] = v;
                        return obj;
                    }, {});
        }
        //console.log(`key: ${key}  /  type: object`);
        return value;
    }, 2);
}

module.exports = {
    stringify,
};
