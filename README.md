# Kanban Colaborativo — Trabalho 4

Aplicação web de quadros Kanban escolares com colaboração em tempo real, autenticação JWT, persistência PostgreSQL/Prisma, API REST, React e Socket.IO.

## Executar do zero

Requisitos: Docker com Compose.

```bash
cp .env.example .env
docker compose up -d --build
```

Abra **http://localhost:3000**; documentação **http://localhost:3000/docs**; saúde **http://localhost:3000/health**.

Usuário inicial (apenas demonstração): **demo@kanban.local / demo123**. Cadastre outros usuários pela interface e convide-os pelo email. **Altere JWT_SECRET e a senha do banco antes de expor o serviço à internet.** O arquivo `.env` não deve ser versionado. A configuração de exemplo contém apenas credenciais locais de desenvolvimento.

### Migrations e seed

O contêiner executa migrations automaticamente no primeiro boot e seed idempotente se `SEED_DEMO=true`.

```bash
docker compose exec app node backend/src/bootstrap.js
docker compose exec app node backend/prisma/seed.js
docker compose logs -f app
```

O bootstrap chama Prisma CLI; para isso, a imagem mantém a dependência de CLI instalada. Para migrations isoladas: `docker compose exec app ./node_modules/.bin/prisma migrate deploy --schema backend/prisma/schema.prisma`.

Parar: `docker compose down`. Para remover também os dados: `docker compose down -v`.

## Recursos REST

CRUD de **projetos, colunas, cartões e comentários**, além de usuários, membros, notificações e histórico. Listagens usam `page`, `limit` e `search` quando aplicável. Erros seguem `{ "error": { "message": "..." } }`. Documentação OpenAPI em `/docs`.

## Eventos Socket.IO

O cliente autentica com `io({auth:{token:'JWT'}})`; salas são identificadas pelo ID do projeto.

| Cliente → servidor | Payload | Resposta |
|---|---|---|
| `project:join` | `{projectId}` | `board:snapshot` |
| `project:leave` | `{projectId}` | Atualização de presença |
| `board:sync` | `{projectId}` | `board:snapshot` |
| `card:move` | `{cardId,columnId,position}` | `card:moved` e `board:changed` |
| `card:editing` | `{projectId,cardId,editing}` | `card:editing` para outros |
| `comment:add` | `{cardId,text}` | `comment:created` |

| Servidor → cliente | Payload |
|---|---|
| `board:snapshot` | Projeto com colunas, cartões, comentários e membros |
| `board:changed` | `{projectId}` |
| `presence:changed` | `{users:[{id,name}]}` |
| `card:moved` / `card:created` / `card:updated` / `card:deleted` | Cartão ou `{id}` |
| `column:created` / `column:updated` / `column:deleted` | Coluna ou `{id}` |
| `comment:created` / `comment:updated` / `comment:deleted` | Comentário ou `{id}` |
| `notification:new` | `{message}` |
| `server:error` | `{message}` |

Eventos recebidos são validados; callbacks opcionais de confirmação retornam `{ok,data}` ou `{ok:false,error}`. O cliente reentra na sala após reconectar e recebe um snapshot completo.

## Testes e demonstração

```bash
npm install
npm test
```

Para demonstrar, abra duas janelas (normal e anônima), entre com dois usuários, convide o segundo para o mesmo projeto, mova um cartão e adicione um comentário. A outra janela atualiza automaticamente. A aba Network do navegador mostra os eventos Socket.IO.

## Estrutura

- `backend/src/domain` — erros de domínio
- `backend/src/application` — casos de uso e publicação de eventos
- `backend/src/adapters/http` — API REST
- `backend/src/adapters/websocket` — eventos e salas
- `backend/prisma` — modelos, migration SQL e seed
- `frontend/src` — React responsivo
- `ARQUITETURA.md` — diagramas, padrões e decisões
- `.github/workflows/ci.yml` — testes e build Docker

## Tecnologias

Node.js 22, Express, Prisma 5, PostgreSQL 16, React 18, Vite, Socket.IO 4, Zod, JWT, Docker e Docker Compose.

## Observações de entrega

Este é um projeto-fonte pronto para revisão e execução; screenshots/GIFs reais e evidências da colaboração da equipe devem ser produzidos após executar a aplicação. Não afirme ter validado o Docker em uma máquina onde ele não foi executado.
