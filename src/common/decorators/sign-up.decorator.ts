import { ApiBody } from '@nestjs/swagger';

export const SignUpDecorator = (fileName: string = 'file'): MethodDecorator => (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
) => {
    ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                password: { type: 'string' },
                passwordConfirm: { type: 'string' },
                profileImage: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })(target, propertyKey, descriptor);
};