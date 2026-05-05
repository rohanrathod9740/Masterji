import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import prisma from "../prisma/client.js";

const registerUser = async (req, res, next) => {
  try {
    const { name, email , phone, password } = req.body;
  // Check if user already exists
  const userExists = await prisma.user.findFirst({
    where: { OR: [{ email: email }, { phone: phone }] },
  });

  if (userExists) {
    return res
      .status(400)
      .json({ error: "User already exists with this email or phone" });
  }

  // Hash Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create User
  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
    },
  });

  // Generate JWT Token
  const token = generateToken(user.id, res);

  res.status(201).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        password: user.password,
      },
      token,
    },
  });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password,phone } = req.body;

  // Check if user email exists in the table
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: email }, { phone: phone }] },
  });

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Generate JWT Token
  const token = generateToken(user.id, res);

  res.status(201).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        email: email,
      },
      token,
    },
  });
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
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

export { registerUser, loginUser, logoutUser };