# Diretrizes de desenvolvimento — ViaSegura

- Trabalhe em uma branch de funcionalidade e preserve a `main` até a revisão.
- Não remova recursos de navegação, responsividade, acessibilidade ou instalação sem validação.
- Respeite a arquitetura atual: React, TypeScript, TanStack Start/Router, Vite, Tailwind CSS e Nitro.
- Preserve a entrada SSR personalizada em `src/server.ts` e o tratamento de erros.
- Diferencie recursos simulados de funcionalidades prontas para produção.
- Para passeios virtuais, não invente elementos físicos do ambiente e diferencie medições de estimativas.
- Prefira alterações pequenas, reversíveis e testadas; execute `npm run build` e `npm run lint` quando disponíveis.
