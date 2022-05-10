import { ApiBody } from '@nestjs/swagger';

export const LocationAddDecorator = (fileName: string = 'file'): MethodDecorator => (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
) => {
    ApiBody({
        schema: {
            type: 'object',
            properties: {
                locationName: { type: 'string' },
                latitude: { type: 'number' },
                longitude: { type: 'number' },
                locationImage: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })(target, propertyKey, descriptor);
};