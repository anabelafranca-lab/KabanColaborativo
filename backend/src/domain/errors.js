export class AppError extends Error { constructor(message,status=400){super(message);this.status=status;} }
export const notFound = (name='Recurso') => new AppError(`${name} não encontrado`,404);
