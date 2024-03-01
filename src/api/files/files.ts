/**
 * VERECL BLOB STORE
 */
import { list, put, del } from '@vercel/blob';

export const config = {
    runtime: 'edge',
};

export const listBlob = async (request: any) => {
    console.log("List data from Vercel Blob");
    const { blobs } = await list();
    return Response.json(blobs);
}

export const uploadBlob = async (request: any) => {
    console.log("Upload data on Vercel Blob");
    const form = await request.body.formData();
    const file = form.get('file') as File;
    console.log("File", file);
    const blob = await put(file.name, file, { access: 'public', multipart: true });
    return Response.json(blob);
}

export const deleteBlob = async (request: Request) => {
    const { searchParams } = new URL(request.url);
    const urlToDelete = searchParams.get('url') as string;
    await del(urlToDelete);

    return new Response();
};