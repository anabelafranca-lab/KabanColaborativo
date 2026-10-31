import 'dotenv/config';
import express from 'express';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swagger from 'swagger-ui-express';
import {ZodError} from 'zod';
import {readFileSync} from 'node:fs';
import routes from './adapters/http/routes.js';
import {setupSockets} from './adapters/websocket/index.js';
import {db} from './config/db.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../');
export const app=express();
app.use(helmet({contentSecurityPolicy:false}));app.use(express.json({limit:'100kb'}));app.use('/api',rateLimit({windowMs:60000,limit:300}));
app.get('/health',async(req,res)=>{try{await db.$queryRaw`SELECT 1`;res.json({status:'ok'});}catch{res.status(503).json({status:'unavailable'});}});
app.use('/docs',swagger.serve,swagger.setup(JSON.parse(readFileSync(path.join(root,'openapi.json'),'utf8'))));
app.use('/api',routes);
app.use(express.static(path.join(root,'frontend/dist')));
app.get('*',(req,res)=>res.sendFile(path.join(root,'frontend/dist/index.html')));
app.use((err,req,res,next)=>{const status=err instanceof ZodError?400:(err.status||500);if(status===500)console.error(err);res.status(status).json({error:{message:err instanceof ZodError?'Dados inválidos':status===500?'Erro interno':err.message,details:err instanceof ZodError?err.flatten():undefined}});});
const server=http.createServer(app);const io=setupSockets(server);
if(process.env.NODE_ENV!=='test'){server.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Servidor iniciado na porta',process.env.PORT||3000));}
let closing=false;async function shutdown(){if(closing)return;closing=true;const timeout=setTimeout(()=>process.exit(1),10000);timeout.unref();io.close();server.close(async()=>{await db.$disconnect();process.exit(0);});}
process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
export {server,io};
