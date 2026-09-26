/**
 * ============================================================================
 * NOTAS DE SEGURANÇA — como o BACKEND REAL deve substituir estes mocks
 * ============================================================================
 *
 * Todos os serviços deste projeto são MOCKS em memória/localStorage, apenas
 * para demonstração de fluxo. Em produção:
 *
 * 1) SQL INJECTION
 *    - Nunca concatenar strings em queries. Usar ORM/query builder com
 *      statements parametrizados (Prisma, Drizzle, SQLAlchemy).
 *    - Validar todo input com schema (Zod) ANTES de tocar o banco.
 *    - Usuário de banco com privilégio mínimo (sem DDL em runtime).
 *
 * 2) XSS
 *    - Nunca usar dangerouslySetInnerHTML com conteúdo do usuário; se for
 *      indispensável, sanitizar com DOMPurify.
 *    - Content-Security-Policy restritiva (sem 'unsafe-inline'), escapar
 *      saídas em templates de e-mail e headers X-Content-Type-Options: nosniff.
 *
 * 3) RATE LIMITING
 *    - Limitar login/cadastro/recuperação por IP + por identificador (CPF),
 *      janela deslizante em Redis. Backoff exponencial e CAPTCHA após N falhas.
 *    - Bloqueio temporário de conta e alerta ao usuário por e-mail.
 *
 * 4) DDoS
 *    - WAF/CDN na borda (Cloudflare), regras de bot management, limites de
 *      tamanho de payload e timeouts curtos. Autoscaling com circuit breaker.
 *
 * 5) JWT + HTTP-ONLY COOKIES (obrigatório)
 *    - Token de sessão em cookie HttpOnly; Secure; SameSite=Strict; Path=/.
 *    - NUNCA armazenar token em localStorage (este mock usa localStorage
 *      apenas porque não existe servidor aqui).
 *    - Access token curto (~15min) + refresh token rotativo com revogação
 *      server-side; verificação de assinatura e claims (iss, aud, exp) em
 *      cada requisição; CSRF token para requisições que mudam estado.
 *
 * 6) AUTORIZAÇÃO
 *    - Roles (STUDENT/INSTRUCTOR/ADMIN) validadas SEMPRE no servidor. A
 *      checagem de role no cliente (como a do QR Code aqui) é apenas UX.
 *    - Roles em tabela separada, nunca no perfil do usuário editável.
 */
export const SECURITY_NOTES = [
  {
    title: "SQL Injection",
    detail: "ORM com statements parametrizados + validação Zod + usuário de banco com privilégio mínimo.",
  },
  {
    title: "XSS",
    detail: "Sem innerHTML de usuário, sanitização com DOMPurify e CSP restritiva.",
  },
  {
    title: "Rate Limiting",
    detail: "Limite por IP e por CPF em Redis, backoff exponencial e CAPTCHA após falhas.",
  },
  {
    title: "DDoS",
    detail: "WAF/CDN na borda, limites de payload, timeouts curtos e circuit breaker.",
  },
  {
    title: "JWT",
    detail: "Sessão em cookie HttpOnly + Secure + SameSite=Strict, refresh rotativo e CSRF token.",
  },
] as const;
