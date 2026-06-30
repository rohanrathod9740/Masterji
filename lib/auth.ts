import { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./db";

const JWT_SECRET = process.env.JWT_SECRET;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: string) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "29d" });
};

export const verifyToken = (token: string): { userId: string } => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

  return {
    userId: decoded.userId,
  };
};

/** Returns the authenticated CONSULTANT user (role = CONSULTANT), or null. */
export const getCurrentUser = async (): Promise<Omit<User, "passwordHash"> | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (tokenError) {
      console.log("Token verification failed:", tokenError);
      return null;
    }

    if (!decoded.userId) return null;

    const userFromDb = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!userFromDb || userFromDb.role !== "CONSULTANT") return null;

    const { passwordHash: _ph, ...user } = userFromDb;
    return user;
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
};

/** Returns the authenticated CLIENT user (role = CLIENT), or null. */
export const getCurrentClient = async (): Promise<Omit<User, "passwordHash"> | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("clientAuthToken")?.value;

    if (!token) return null;

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (tokenError) {
      console.log("Client token verification failed:", tokenError);
      return null;
    }

    if (!decoded.userId) return null;

    const userFromDb = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!userFromDb || userFromDb.role !== "CLIENT") return null;

    const { passwordHash: _ph, ...safeClient } = userFromDb;
    return safeClient;
  } catch (error) {
    console.error("getCurrentClient error:", error);
    return null;
  }
};