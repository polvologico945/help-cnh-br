import { onlyDigits } from "./cpf";

/**
 * Regra de senha: exatos 6 dígitos numéricos, sem sequências (crescentes ou
 * decrescentes), sem repetições totais e sem conter trechos do CPF do usuário.
 *
 * SEGURANÇA (backend real): a mesma política deve ser aplicada no servidor e a
 * senha armazenada apenas como hash (argon2id/bcrypt com salt por usuário).
 */
export function validatePassword(password: string, cpf: string): string[] {
  const errors: string[] = [];

  if (!/^\d{6}$/.test(password)) {
    errors.push("A senha deve ter exatamente 6 dígitos numéricos.");
    return errors;
  }

  if (/^(\d)\1{5}$/.test(password)) {
    errors.push("A senha não pode ter todos os dígitos iguais.");
  }

  const isSequence = (dir: 1 | -1) =>
    password.split("").every((ch, i, arr) => i === 0 || Number(ch) === Number(arr[i - 1]) + dir);

  if (isSequence(1) || isSequence(-1)) {
    errors.push("A senha não pode ser uma sequência (ex: 123456 ou 654321).");
  }

  const cpfDigits = onlyDigits(cpf);
  if (cpfDigits.length >= 3) {
    for (let i = 0; i + 3 <= cpfDigits.length; i += 1) {
      const chunk = cpfDigits.slice(i, i + 3);
      if (password.includes(chunk)) {
        errors.push("A senha não pode conter trechos do seu CPF.");
        break;
      }
    }
  }

  return errors;
}
