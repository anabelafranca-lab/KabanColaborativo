# ADR: Socket.IO e salas por projeto

**Status:** Aceita

## Contexto
O projeto Kanban Colaborativo precisa atender aos requisitos de API REST, persistência, arquitetura, comunicação em tempo real e execução por Docker.

## Decisão
Integrar Socket.IO ao mesmo servidor HTTP da API, autenticar por JWT, validar mensagens com Zod e segmentar eventos por projeto.

## Consequências
Sincronização de múltiplos clientes e reconexão; para múltiplas instâncias seria necessário um adaptador distribuído.

## Referências no código
Consulte `ARQUITETURA.md` e as pastas `backend/src/`, `backend/prisma/` e os arquivos de Docker na raiz do projeto.
