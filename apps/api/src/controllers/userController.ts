import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import {prisma} from "../lib/db";
import { generateToken } from "../utils/generateToken";


// ================= REGISTER USER =================

const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, phone, password } = req.body;

    // Validation
    if ((!email && !phone) || !password || !name) {
      res.status(400).json({
        status: "fail",
        message: "Name, password and email or phone are required",
      });
      return;
    }

    // Check if user exists
    const userExists = await prisma.user.findFirst({
      where: email
        ? { email }
        : { phone },
    });

    if (userExists) {
      res.status(400).json({
        status: "fail",
        message: "User already exists",
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
      },
    });

    // Generate token
    const token = generateToken(user.id, res);

    res.status(201).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        token,
      },
    });

  } catch (error) {
    next(error);
  }
};


// ================= LOGIN USER =================

const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, phone, password } = req.body;

    // Validation
    if ((!email && !phone) || !password) {
      res.status(400).json({
        status: "fail",
        message: "Email or phone and password are required",
      });
      return;
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: email
        ? { email }
        : { phone },
    });

    if (!user) {
      res.status(401).json({
        status: "fail",
        message: "Invalid credentials",
      });
      return;
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      res.status(401).json({
        status: "fail",
        message: "Invalid credentials",
      });
      return;
    }

    // Generate token
    const token = generateToken(user.id, res);

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        token,
      },
    });

  } catch (error) {
    next(error);
  }
};


// ================= LOGOUT USER =================

const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {

    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });

  } catch (error) {
    next(error);
  }
};


export {
  registerUser,
  loginUser,
  logoutUser,
};