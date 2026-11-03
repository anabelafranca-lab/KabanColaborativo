# ADR: Arquitetura em camadas

**Status:** Aceita

## Contexto
O projeto Kanban Colaborativo precisa atender aos requisitos de API REST, persistência, arquitetura, comunicação em tempo real e execução por Docker.

## Decisão
Separar domínio, aplicação e adaptadores HTTP/WebSocket para compartilhar regras de negócio e evitar lógica duplicada.

## Consequências
Maior organização e testabilidade; exige disciplina para manter as dependências entre camadas.

## Referências no código
Consulte `ARQUITETURA.md` e as pastas `backend/src/`, `backend/prisma/` e os arquivos de Docker na raiz do projeto.
