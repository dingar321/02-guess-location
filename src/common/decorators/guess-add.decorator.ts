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
                longitude: { type: 'number' },
                latitude: { type: 'number' },
            },
        },
    })(target, propertyKey, descriptor);
};