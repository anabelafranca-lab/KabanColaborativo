import jwt from 'jsonwebtoken';
import {AppError} from '../../domain/errors.js';
export const secret=()=>process.env.JWT_SECRET||'somente-para-testes-locais';
export const token=user=>jwt.sign({id:user.id,name:user.name},secret(),{expiresIn:'7d'});
export function auth(req,res,next){try{const raw=req.headers.authorization?.replace(/^Bearer /,'');if(!raw)throw new Error();req.user=jwt.verify(raw,secret());next();}catch{next(new AppError('Autenticação necessária',401));}}
