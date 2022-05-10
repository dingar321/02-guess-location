import AWS, { S3 } from 'aws-sdk';
import { Logger, Injectable } from '@nestjs/common';
import { S3DataDto } from './dto/s3-data.dto';

//Add info:
//https://dev.to/vjnvisakh/uploading-to-s3-using-nestjs-4037
//https://stackoverflow.com/questions/61402054/nestjs-how-to-upload-image-to-aws-s3

//Delete info:
//https://stackoverflow.com/questions/27753411/how-do-i-delete-an-object-on-aws-s3-using-javascript
//https://wanago.io/2020/08/03/api-nestjs-uploading-public-files-to-amazon-s3/

@Injectable()
export class S3BucketService {

    getS3() {
        return new S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });
    }

    async uploadImage(profileImage: Express.Multer.File, filePath: string): Promise<S3DataDto> {

        const imageName = await this.imageNameProcessor(profileImage, filePath);

        const s3 = this.getS3();
        const params =
        {
            Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
            Key: imageName,
            Body: profileImage.buffer,
            ContentDisposition: "inline",
            //Concent type allows the image to be viewed on the browser instead of a download
            ContentType: profileImage.mimetype,
            /*
            ACL: "public-read",
            CreateBucketConfiguration:
            {
                LocationConstraint: process.env.AWS_REGION
            }
            */
        };

        return new Promise((resolve, reject) => {
            s3.upload(params, (error, data) => {
                if (error) {
                    Logger.error(error);
                    reject(error.message);
                }
                Logger.log('Image has been successfully upladed');
                resolve(data);
            });
        });
    }

    async deleteImage(Key: string) {

        const s3 = this.getS3();
        var params =
        {
            Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
            Key: Key
        };

        s3.deleteObject(params, (error, data) => {
            if (error) {
                Logger.error(error);
            }
            Logger.log('Image has been successfully deleted');
        });
    }


    imageNameProcessor(profileImage: Express.Multer.File, filePath: string) {
        //Get the file name
        const { originalname } = profileImage;

        //Adding unix time created infront of the name
        //For images that may have the same name
        //Removes the paranthases if the file is a copy
        const unixCreated = new Date().getTime()
        var imageName = unixCreated + originalname.replace(/\s/g, "");
        imageName = imageName.replace(/ *\([^)]*\) */g, "");

        const finalName = filePath + '/' + imageName
        return finalName
    }

}