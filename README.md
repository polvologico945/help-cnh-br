# ViaSegura — Educação de Trânsito

Aplicação web responsiva, preparada para instalação como PWA, para experiências educacionais de trânsito e acompanhamento de aulas.

## Tecnologias

- React 19 e TypeScript
- TanStack Start / TanStack Router e TanStack Query
- Vite 8 (desenvolvimento e compilação)
- Tailwind CSS 4 e componentes Radix UI
- Nitro (servidor e saída de produção)

O projeto usa ferramentas abertas e uma configuração de compilação independente.

## Como executar

Requisitos: Node.js compatível com Vite 8 e npm.

```bash
git clone https://github.com/polvologico945/help-cnh-br.git
cd help-cnh-br
npm ci
npm run dev
```

O terminal informará o endereço do servidor de desenvolvimento.

## Verificações e produção

```bash
npm run lint
npm run build
npm run preview
```

A compilação usa TanStack Start com Nitro. Para hospedar, configure o destino de implantação apropriado ao seu servidor ou provedor. A branch principal deve ser atualizada somente após a validação das alterações.

## Estrutura principal

- `src/routes/`: páginas e roteamento.
- `src/components/`: componentes de interface.
- `src/lib/`: utilitários e protótipos de serviços.
- `src/server.ts`: entrada do servidor e tratamento de erros SSR.
- `public/manifest.webmanifest`: informações de instalação do PWA.
- `public/icons/`: ícones próprios da aplicação.
- `vite.config.ts`: plugins diretos de compilação.

**Estado atual:** o projeto contém serviços simulados no navegador, sem backend de produção. A presença de um manifesto PWA não garante funcionamento offline; isso depende de uma implementação e validação específicas de cache e Service Worker.
