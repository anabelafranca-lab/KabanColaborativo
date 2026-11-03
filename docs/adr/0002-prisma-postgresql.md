# ADR: PostgreSQL e Prisma ORM

**Status:** Aceita

## Contexto
O projeto Kanban Colaborativo precisa atender aos requisitos de API REST, persistência, arquitetura, comunicação em tempo real e execução por Docker.

## Decisão
Usar PostgreSQL como fonte persistente de dados e Prisma ORM para modelos, migrações e operações transacionais.

## Consequências
Relacionamentos e histórico persistidos; migrations precisam ser executadas durante a implantação.

## Referências no código
Consulte `ARQUITETURA.md` e as pastas `backend/src/`, `backend/prisma/` e os arquivos de Docker na raiz do projeto.
