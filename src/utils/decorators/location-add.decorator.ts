import { ApiBody } from '@nestjs/swagger';
import { SignUpDto } from 'src/authentication/dto/sign-up.dto';

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
                longitude: { type: 'number' },
                latitude: { type: 'number' },
                locationImage: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })(target, propertyKey, descriptor);
};