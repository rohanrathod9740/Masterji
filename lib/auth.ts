import { User } from "@/prisma/migrations/client";
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
        if(!token){
            return null;
        }
        const decoded =  verifyToken(token);
        const userFromDb = await prisma.user.findUnique({
            where:{id:decoded.userId},
        })
        if (!userFromDb) return null;
        const {password,...user} = userFromDb;
        return user as User;
    }
    catch(error){
        console.log("error:",error);
        return null;
    }
}