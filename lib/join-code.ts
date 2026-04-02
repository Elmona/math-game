const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CODE_LENGTH = 6;

export function generateJoinCode(): string {
  return Array.from(
    { length: CODE_LENGTH },
    () => CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join("");
}
