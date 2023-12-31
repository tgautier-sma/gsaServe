"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genUniqueId = void 0;
const genUniqueId = () => {
    const dateStr = Date
        .now()
        .toString(36); // convert num to base 36 and stringify
    const randomStr = Math
        .random()
        .toString(36)
        .substring(2, 8); // start at index 2 to skip decimal point
    return `${dateStr}-${randomStr}`;
};
exports.genUniqueId = genUniqueId;
//# sourceMappingURL=tools.js.map