import { S3 } from 'aws-sdk';
import { Logger, Injectable } from '@nestjs/common';
import { S3DataDto } from './dto/s3-data.dto';
import { Timestamp } from 'typeorm';
import { Response } from 'express';

//Add info:
//https://dev.to/vjnvisakh/uploading-to-s3-using-nestjs-4037
//https://stackoverflow.com/questions/61402054/nestjs-how-to-upload-image-to-aws-s3

//Delete info:
//https://stackoverflow.com/questions/27753411/how-do-i-delete-an-object-on-aws-s3-using-javascript
//https://wanago.io/2020/08/03/api-nestjs-uploading-public-files-to-amazon-s3/

/*
When sending data to the upload method we need to specify 3 parameters:
    - The image file itself
    - objects id
    - name of object and 'Id' at the end of it
*/

@Injectable()
export class S3BucketService {
    logger: any;
    constructor() {
        this.logger = require('node-color-log');
    }


    getS3() {
        return new S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });
    }

    //#region Uploading the provided picture to the AWS S3 Bucket 
    async uploadImage(profileImage: Express.Multer.File, objectId: number, objectName: string, userId: number): Promise<string> {

        const imageName = await this.pictureNamingScheme(profileImage, objectId, objectName);

        var direcotry;
        switch (objectName) {
            case 'userId':
                direcotry = objectName.slice(0, -2) + objectId + '/';
                break;
            case 'locationId':
                direcotry = 'user' + userId + '/' + objectName.slice(0, -2) + '/';
                break;
        }

        const s3 = this.getS3();
        const params =
        {
            Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
            Key: direcotry + imageName,
            Body: profileImage.buffer,
            ContentDisposition: "inline",
            ContentType: profileImage.mimetype,
        };  

        return new Promise((resolve, reject) => {
            s3.upload(params, (error, data) => {
                if (error) {
                    this.logger.color('red').error(error);
                    reject(error.message);
                }
                this.logger.color('blue').success("Image: " + imageName + " successfully uploaded");
                resolve(data.Key);
            });
        });
    }
    //#endregion

    //#region Deleting the specified image from the AWS S3 Bucket
    async deleteImage(Key: string) {

        const s3 = this.getS3();
        var params =
        {
            Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
            Key: Key
        };

        s3.deleteObject(params, (error, data) => {
            if (error) {
                this.logger.color('red').error(error);
            } else {
                this.logger.color('blue').success("Image: " + data + " successfully deleted");
            }
        });
    }
    //#endregion

    //#region Getting the URL of a specified image form the AWS S3 Bucket
    async getImage(Key: string): Promise<string> {
        const s3 = this.getS3();
        var params =
        {
            Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
            Key: Key,
        };

        //Returning the url to the image
        return await new Promise((resolve, reject) => {
            s3.getSignedUrl('getObject', params, function (error, data) {
                if (error) {
                    this.logger.color('red').error(error);
                    reject(error.message);
                }
                //this.logger.color('blue').success("Image: " + data + " successfully retrieved");
                resolve(data);
            });
        });
    }
    //#endregion

    getPictureExtension(profileImage: Express.Multer.File) {
        const { originalname } = profileImage;

        var fileExtension = originalname.split(".");
        return '.' + fileExtension[fileExtension.length - 1]
    }

    pictureNamingScheme(profileImage: Express.Multer.File, objectId: number, objectName: string) {
        /* 
        The picture names contain: 
           unixTime-randomString-userId-fileName.fileExtension 
        */
        var imageName;

        //Unix time
        const unixCreated = new Date().getTime()
        //Random string (4bytes)
        var crypto = require("crypto");
        //var randString = crypto.randomBytes(4).toString('hex');
        //Users id
        const object = objectName + objectId;
        //File name
        const { originalname } = profileImage;
        //File extension
        const extension = this.getPictureExtension(profileImage);

        imageName = + unixCreated + '-' +
            object + '-' + this.stringProcesor(originalname.slice(0, -4)) + extension;

        return imageName;
    }

    stringProcesor(originialName: string) {
        /*
        For example, if a file "My Holiday: Florida 23.jpg"
        It will get processed in to: my-holiday-florida-23.jpg
        */
        //Removes any symbol we dont want 
        originialName = originialName.replace(/[^\wščćđž\s]/gi, '');
        //Remove any excess spaces
        originialName = originialName.replace(/\s+/g, ' ').trim();
        //Replace spaces with dashes (-)
        originialName = originialName.replace(/\s+/g, '_');
        //Return and set all characters to lowercase
        return originialName.toLowerCase();
    }

}