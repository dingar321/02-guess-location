import { ApiBody } from '@nestjs/swagger';

export const UploadImage = (fileName: string = 'file'): MethodDecorator => (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
) => {
    ApiBody({
        schema: {
            type: 'object',
            properties: {
                profileImage: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })(target, propertyKey, descriptor);
};