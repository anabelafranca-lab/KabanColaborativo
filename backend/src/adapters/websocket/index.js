import {Server} from 'socket.io';
import jwt from 'jsonwebtoken';
import {z} from 'zod';
import {secret} from '../http/auth.js';
import {access,board,moveCard,notifyComment} from '../../application/service.js';
import {setEmitter} from '../../application/events.js';
const safe=(socket,fn)=>async(payload={},ack)=>{try{const result=await fn(payload);if(typeof ack==='function')ack({ok:true,data:result});}catch(e){socket.emit('server:error',{message:e.message});if(typeof ack==='function')ack({ok:false,error:e.message});}};
export function setupSockets(server){const io=new Server(server,{cors:{origin:false}});io.use((socket,next)=>{try{socket.user=jwt.verify(socket.handshake.auth.token,secret());next();}catch{next(new Error('Não autorizado'));}});setEmitter((room,event,payload)=>io.to(room).emit(event,payload));io.on('connection',socket=>{socket.join(`user:${socket.user.id}`);
 socket.on('project:join',safe(socket,async({projectId})=>{z.string().min(1).parse(projectId);await access(socket.user.id,projectId);for(const room of socket.rooms)if(room!==socket.id&&room!==`user:${socket.user.id}`)socket.leave(room);socket.join(projectId);const snapshot=await board(socket.user.id,projectId);socket.emit('board:snapshot',snapshot);io.to(projectId).emit('presence:changed',{users:[...io.sockets.sockets.values()].filter(s=>s.rooms.has(projectId)).map(s=>({id:s.user.id,name:s.user.name}))});return snapshot;}));
 socket.on('project:leave',safe(socket,async({projectId})=>{z.string().min(1).parse(projectId);socket.leave(projectId);io.to(projectId).emit('presence:changed',{users:[...io.sockets.sockets.values()].filter(s=>s.rooms.has(projectId)).map(s=>({id:s.user.id,name:s.user.name}))});}));
 socket.on('card:move',safe(socket,async({cardId,columnId,position=0})=>{z.object({cardId:z.string().min(1),columnId:z.string().min(1),position:z.number().int().min(0)}).parse({cardId,columnId,position});return moveCard(socket.user.id,cardId,columnId,position);}));
 socket.on('card:editing',safe(socket,async({projectId,cardId,editing})=>{z.object({projectId:z.string(),cardId:z.string(),editing:z.boolean()}).parse({projectId,cardId,editing});await access(socket.user.id,projectId);if(!socket.rooms.has(projectId))throw new Error('Entre na sala antes');socket.to(projectId).emit('card:editing',{cardId,editing,user:socket.user.name,userId:socket.user.id});}));
 socket.on('comment:add',safe(socket,async({cardId,text})=>{z.object({cardId:z.string(),text:z.string().trim().min(1).max(2000)}).parse({cardId,text});return notifyComment(socket.user.id,cardId,text);}));
 socket.on('board:sync',safe(socket,async({projectId})=>{const snapshot=await board(socket.user.id,z.string().min(1).parse(projectId));socket.emit('board:snapshot',snapshot);return snapshot;}));
 socket.on('disconnect',()=>{for(const room of socket.rooms)if(room!==socket.id)io.to(room).emit('presence:changed',{users:[...io.sockets.sockets.values()].filter(s=>s.rooms.has(room)).map(s=>({id:s.user.id,name:s.user.name}))});});
 });return io;}
