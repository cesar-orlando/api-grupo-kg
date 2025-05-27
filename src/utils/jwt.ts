import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secretdev";

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}
