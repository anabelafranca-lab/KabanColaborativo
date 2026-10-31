import 'dotenv/config';
import {PrismaClient} from '@prisma/client';
import bcrypt from 'bcryptjs';
const db=new PrismaClient();
try {
 const email='demo@kanban.local';
 let user=await db.user.findUnique({where:{email}});
 if(!user)user=await db.user.create({data:{name:'Demonstração',email,password:await bcrypt.hash('demo123',10)}});
 const existing=await db.project.findFirst({where:{name:'Projeto Demonstração',memberships:{some:{userId:user.id}}}});
 if(!existing){
  const project=await db.project.create({data:{
   name:'Projeto Demonstração',description:'Quadro inicial para testar a colaboração',
   memberships:{create:{userId:user.id,role:'owner'}},
   columns:{create:[
    {name:'A fazer',position:0,cards:{create:[{title:'Planejar apresentação',description:'Preparar a demonstração com duas abas'},{title:'Testar WebSocket'}]}},
    {name:'Em andamento',position:1},
    {name:'Concluído',position:2}
   ]}
  }});
  console.log('Projeto criado:',project.id);
 }
 console.log('Demo: demo@kanban.local / demo123');
}finally{await db.$disconnect();}
