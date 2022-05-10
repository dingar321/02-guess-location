import { ApiBody } from '@nestjs/swagger';

export const GuessAddDecorator = (fileName: string = 'file'): MethodDecorator => (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
) => {
    ApiBody({
        schema: {
            type: 'object',
            properties: {
                latitude: { type: 'number' },
                longitude: { type: 'number' },
            },
        },
    })(target, propertyKey, descriptor);
};