# ViaSegura — Educação de Trânsito

Aplicação web responsiva preparada para instalação como PWA, com uma jornada guiada de preparação para as aulas de direção e um futuro percurso virtual construído a partir de imagens reais.

## Tecnologias

- React 19 e TypeScript
- TanStack Start, TanStack Router e TanStack Query
- Vite 8 e Nitro
- Tailwind CSS 4, Radix UI e lucide-react
- qrcode.react (QR Code SVG legível)

## Telas existentes

| Rota | Finalidade | Situação |
| --- | --- | --- |
| `/` | Cadastro/login de alunos | Demonstração no navegador |
| `/painel` | Escolha do serviço, vínculo, área didática após confirmação | Demonstração |
| `/instrutor?convite=...` | Confirmação de um convite aberto por QR Code | Demonstração, sem login real de instrutor |
| `/admin` | Indicadores, perfis, filtros, CSV, catálogo e operação | Demonstração |

### Jornada do aluno

1. Faça cadastro ou login; escolha serviço e categoria.
2. Gere um QR Code temporário, válido por 2 minutos.
3. O instrutor abre o convite com a câmera do celular e confirma o vínculo **na página de demonstração**.
4. O aluno aguarda o aviso de confirmação, reconhecido automaticamente pela aplicação.
5. O espaço de aprendizagem oferece início, preparação pré-aula, checklist, caderno e a área reservada ao percurso.

A área de percurso não apresenta ruas nem fotografias fictícias. O conteúdo 360° será implementado após a captura e validação de imagens reais.

### Atenção: limites da demonstração

**Este projeto NÃO está pronto para armazenar dados pessoais reais ou operar com instrutores verdadeiros.**

- Cadastro, login e painel admin usam dados simulados/localStorage; credenciais admin estão no código-fonte.
- A tela `/instrutor` ainda não verifica a identidade de um instrutor. Qualquer pessoa com o convite pode confirmar a demonstração.
- Os convites são armazenados em memória de um **único processo servidor**, não em banco de dados; funcionam entre dispositivos que acessam a mesma instância, mas perdem-se ao reiniciar e não são adequados a múltiplas instâncias.
- O vínculo autorizado é registrado no navegador do aluno, não em uma sessão segura persistente.
- Edição de alunos, autoavaliação e caderno de bordo são locais ao navegador; a administração não vê os registros de outros dispositivos.
- O manifesto PWA existe; cache offline/Service Worker precisam ser planejados e testados separadamente.

Para produção serão necessários autenticação e autorização no servidor (aluno/instrutor/admin), contas de instrutor validadas, banco de dados, convites persistentes de uso único, trilhas de auditoria, proteção e tratamento apropriado de dados pessoais.

## Desenvolver

Requer Node.js compatível com Vite 8 e npm.

```bash
git clone https://github.com/polvologico945/help-cnh-br.git
cd help-cnh-br
npm ci
npm run dev
```

Verificações:

```bash
npx tsc --noEmit
npm run lint
npm run build
npm run preview
```

## Estrutura

- `src/routes/`: páginas.
- `src/components/`: elementos reutilizáveis e ambiente do aluno.
- `src/lib/linking.ts`: operações de vínculo de demonstração no servidor.
- `src/lib/linking-store.server.ts`: memória temporária dos convites.
- `src/lib/mock/`: autenticação e registros locais simulados.
- `src/server.ts`: entrada SSR e tratamento de erros.
- `public/manifest.webmanifest` e `public/icons/`: identidade visual do PWA.

Trabalhe em branches; não integre na `main` até a validação do fluxo ponta a ponta.
