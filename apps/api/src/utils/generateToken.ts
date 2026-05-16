import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { Response } from "express";

export const generateToken = (
  userId: string,
  res: Response
): string => {
  const payload = { id: userId };

  const secret: Secret = process.env.JWT_SECRET as Secret;

  const options: SignOptions = {
    expiresIn: "7d",
  };

  const token = jwt.sign(payload, secret, options);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  return token;
};