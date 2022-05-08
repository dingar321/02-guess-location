import { S3 } from 'aws-sdk';
import { Logger, Injectable } from '@nestjs/common';
import { S3DataDto } from './dto/s3-data.dto';

//https://wanago.io/2020/08/03/api-nestjs-uploading-public-files-to-amazon-s3/ (Delete)
//https://dev.to/vjnvisakh/uploading-to-s3-using-nestjs-4037
//https://stackoverflow.com/questions/61402054/nestjs-how-to-upload-image-to-aws-s3

@Injectable()
export class ImageUploadeService {
    s3: any;

    //add type
    async uploadImage(profileImage): Promise<S3DataDto> {
        const { originalname } = profileImage;
        const bucketS3 = process.env.AWS_PUBLIC_BUCKET_NAME;

        const s3 = this.getS3();

        //Adding unix time created infront of the name
        //For images that may have the same name
        const unixCreated = new Date().getTime()
        const imageName = unixCreated + originalname.replace(/\s/g, "");
        //Removes the paranthases if the file is a copy
        //const imageNameProcessed = imageName.replace(/ *\([^)]*\) */g, "");

        const params =
        {
            Bucket: bucketS3,
            Key: String(imageName),
            Body: profileImage.buffer,
            //ACL: "public-read",
            ContentType: profileImage.mimetype,
            ContentDisposition: "inline",
            CreateBucketConfiguration:
            {
                LocationConstraint: process.env.AWS_REGION
            }
        };

        return new Promise((resolve, reject) => {
            s3.upload(params, (err, data) => {
                if (err) {
                    Logger.error(err);
                    reject(err.message);
                }
                resolve(data);
            });
        });
    }

    getS3() {
        return new S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });
    }
}