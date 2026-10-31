import {db} from '../config/db.js';
import {AppError,notFound} from '../domain/errors.js';
import {publish} from './events.js';
export async function access(userId,projectId){const m=await db.membership.findUnique({where:{userId_projectId:{userId,projectId}}});if(!m)throw new AppError('Acesso negado ao projeto',403);return m;}
export async function board(userId,projectId){
 await access(userId,projectId);
 const project=await db.project.findUnique({
  where:{id:projectId},
  include:{
   columns:{orderBy:{position:'asc'},include:{
    cards:{orderBy:{position:'asc'},include:{
     comments:{include:{author:{select:{id:true,name:true}}},orderBy:{createdAt:'asc'}},
     activities:{orderBy:{createdAt:'desc'},take:30,include:{actor:{select:{name:true}}}}
    }}
   }},
   memberships:{include:{user:{select:{id:true,name:true}}}}
  }
 });
 if(!project)throw notFound('Projeto');
 return project;
}
export async function cardProject(cardId){const card=await db.card.findUnique({where:{id:cardId},include:{column:true}});if(!card)throw notFound('Cartão');return {card,projectId:card.column.projectId};}
export async function log(projectId,cardId,actorId,action,details=''){return db.activity.create({data:{projectId,cardId,actorId,action,details}});}
export async function moveCard(userId,cardId,columnId,position=0){const {card,projectId}=await cardProject(cardId);await access(userId,projectId);const target=await db.boardColumn.findUnique({where:{id:columnId}});if(!target||target.projectId!==projectId)throw new AppError('Coluna inválida',400);const result=await db.$transaction(async tx=>{const updated=await tx.card.update({where:{id:cardId},data:{columnId,position,version:{increment:1}}});await tx.activity.create({data:{projectId,cardId,actorId:userId,action:'move',details:`${card.column.name} → ${target.name}`}});return updated;});publish(projectId,'card:moved',result);publish(projectId,'board:changed',{projectId});return result;}
export async function notifyComment(userId,cardId,text){const {projectId}=await cardProject(cardId);await access(userId,projectId);const result=await db.$transaction(async tx=>{const comment=await tx.comment.create({data:{cardId,authorId:userId,text},include:{author:{select:{id:true,name:true}}}});await tx.activity.create({data:{projectId,cardId,actorId:userId,action:'comment',details:text}});const members=await tx.membership.findMany({where:{projectId,userId:{not:userId}}});await tx.notification.createMany({data:members.map(m=>({userId:m.userId,message:`Novo comentário no cartão: ${text.slice(0,80)}`}))});return {comment,recipients:members.map(m=>m.userId)};});publish(projectId,'comment:created',result.comment);publish(projectId,'board:changed',{projectId});for(const id of result.recipients)publish(`user:${id}`,'notification:new',{message:'Novo comentário recebido'});return result.comment;}
