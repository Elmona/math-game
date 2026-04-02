import { generateJoinCode } from "../join-code";

describe("generateJoinCode", () => {
  it("returns a 6-character string", () => {
    expect(generateJoinCode()).toHaveLength(6);
  });

  it("contains only uppercase letters and digits", () => {
    const code = generateJoinCode();
    expect(code).toMatch(/^[A-Z0-9]{6}$/);
  });

  it("produces different codes on successive calls", () => {
    const codes = new Set(Array.from({ length: 20 }, generateJoinCode));
    expect(codes.size).toBeGreaterThan(1);
  });
});
