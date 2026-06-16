import { User, Client } from "@/prisma/migrations/client";
import bcrypt from "bcryptjs"
import jwt,{JwtPayload} from "jsonwebtoken"
import { cookies } from "next/headers";
import { prisma } from "./db";

const JWT_SECRET = process.env.JWT_SECRET

export const hashPassword = async (password:string): Promise<string> =>{
    return bcrypt.hash(password,10);
};

export const verifyPassword = async (password:string,hashedPassword:string): Promise<boolean> =>{
    return bcrypt.compare(password,hashedPassword);
};

export const generateToken = (userId: string) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: "29d" }
  );
};

export const verifyToken = (
  token: string
): { userId: string } => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

  return {
    userId: decoded.userId,
  };
};


export const getCurrentUser =  async ():Promise<User | null> => {
    try{
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        
        // Token not found - not authenticated
        if(!token){
            return null;
        }

        // Verify and decode the token
        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (tokenError) {
            // Token is invalid, expired, or tampered with
            console.log("Token verification failed:", tokenError);
            return null;
        }

        // Validate userId exists in token
        if (!decoded.userId) {
            console.log("No userId in token");
            return null;
        }

        // Fetch user from database to ensure they still exist
        const userFromDb = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        // User doesn't exist in database
        if (!userFromDb) {
            console.log("User not found in database");
            return null;
        }

        // Return user without password
        const { password, ...user } = userFromDb;
        return user as User;
    }
    catch(error){
        console.error("getCurrentUser error:", error);
        return null;
    }
}

/** Reads the clientAuthToken cookie and returns the matching Client or null. */
export const getCurrentClient = async (): Promise<Omit<Client, "passwordHash"> | null> => {
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

        const clientFromDb = await prisma.client.findUnique({
            where: { id: decoded.userId },
        });

        if (!clientFromDb) return null;

        // Strip passwordHash before returning
        const { passwordHash: _ph, ...safeClient } = clientFromDb;
        return safeClient;
    } catch (error) {
        console.error("getCurrentClient error:", error);
        return null;
    }
}