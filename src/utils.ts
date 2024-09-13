export const collectKeys = (obj: Record<string, any>, prefix: string = ''): string[] => {
    let keys: string[] = [];

    for (let key in obj) {
        if (obj[key]) {
            let newPrefix = prefix || key;
            if (isNaN(Number(key.toString()))) {
                newPrefix = prefix ? `${prefix}.${key}` : key;
            }
            keys.push(newPrefix);

            if (typeof obj[key] === 'object' && obj[key] !== null) {
                keys = keys.concat(collectKeys(obj[key], newPrefix));
            }
        }
    }

    return [...new Set(keys)];
};
