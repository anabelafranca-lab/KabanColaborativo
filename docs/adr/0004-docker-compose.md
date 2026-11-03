# ADR: Docker Compose e configuração por ambiente

**Status:** Aceita

## Contexto
O projeto Kanban Colaborativo precisa atender aos requisitos de API REST, persistência, arquitetura, comunicação em tempo real e execução por Docker.

## Decisão
Empacotar a aplicação e PostgreSQL com Docker Compose, volume persistente, health checks e variáveis de ambiente, servindo o frontend compilado pelo backend.

## Consequências
Reprodução do ambiente com poucos comandos; depende do Docker instalado e das variáveis corretamente configuradas.

## Referências no código
Consulte `ARQUITETURA.md` e as pastas `backend/src/`, `backend/prisma/` e os arquivos de Docker na raiz do projeto.
