import { Injectable } from '@nestjs/common';
import { CloudinaryResponse } from './cloudinary-response';
import { v2 as cloudinary } from 'cloudinary'
const streamifier = require('streamifier')

@Injectable()
export class CloudinaryService {
    async UploadFile(file: Express.Multer.File): Promise<CloudinaryResponse>{
        return new Promise<CloudinaryResponse>((resolve, reject) => {
            const uploadStream  = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if(error) return reject(error);
                    resolve(result!);
                },
            );
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        })
    }
}
