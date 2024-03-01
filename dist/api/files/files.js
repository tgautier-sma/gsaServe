"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlob = exports.uploadBlob = exports.listBlob = exports.config = void 0;
/**
 * VERECL BLOB STORE
 */
const blob_1 = require("@vercel/blob");
console.log("Vercel Blob Key :", process.env.BLOB_READ_WRITE_TOKEN);
exports.config = {
    runtime: 'edge',
};
const listBlob = async (request) => {
    console.log("List data from Vercel Blob");
    const { blobs } = await (0, blob_1.list)();
    return Response.json(blobs);
};
exports.listBlob = listBlob;
const uploadBlob = async (request) => {
    console.log("Upload data on Vercel Blob");
    const form = await request.body.formData();
    const file = form.get('file');
    console.log("File", file);
    const blob = await (0, blob_1.put)(file.name, file, { access: 'public', multipart: true });
    return Response.json(blob);
};
exports.uploadBlob = uploadBlob;
const deleteBlob = async (request) => {
    const { searchParams } = new URL(request.url);
    const urlToDelete = searchParams.get('url');
    await (0, blob_1.del)(urlToDelete);
    return new Response();
};
exports.deleteBlob = deleteBlob;
//# sourceMappingURL=files.js.map