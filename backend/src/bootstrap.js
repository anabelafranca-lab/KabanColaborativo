import {execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';
const prisma=process.platform==='win32'?'node_modules/.bin/prisma.cmd':'node_modules/.bin/prisma';
if(!existsSync(prisma))throw new Error('Prisma CLI não encontrado');
execFileSync(prisma,['generate','--schema','backend/prisma/schema.prisma'],{stdio:'inherit'});
execFileSync(prisma,['migrate','deploy','--schema','backend/prisma/schema.prisma'],{stdio:'inherit'});
if(process.env.SEED_DEMO==='true')execFileSync('node',['backend/prisma/seed.js'],{stdio:'inherit'});
