import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../entities/user";
import { createPool } from "../../../shared/db";
import logger from "../../../shared/logger";

const pool = createPool("account");

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await getUsers();
    res.status(201).json({ users });
  } catch (error) {
    logger.error(`Error fetching users: ${error.message}`);
    res.status(500).json({ message: `Error fetching users: ${error.message}` });
    return;
  }
};

export const getUsers = async () => {
  const result = await pool.query("SELECT * FROM users");
  return result.rows;
};

export const createUser = async (
  username: string,
  password: string,
  role: string = "User"
): Promise<User> => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role",
    [username, hashedPassword, role]
  );
  return result.rows[0];
};

export const findUserByUsername = async (
  username: string
): Promise<User | null> => {
  const result = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return result.rows[0] || null;
};

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    logger.error(`Error during register: Username and password are required`);
    res.status(400).json({ message: "Username and password are required" });
    return;
  }

  try {
    const user = await createUser(username, password, role);
    logger.info(`User created: ${user}`);
    res.status(201).json({ message: "User created", user });
  } catch (error) {
    logger.error(`Error during user registration: ${error.message}`);
    res
      .status(500)
      .json({ message: `Error during user registration: ${error.message}` });
    return;
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    logger.error(`Error during login: Username and password are required`);
    res.status(400).json({ message: "Username and password are required" });
    return;
  }

  try {
    const user: User | null = await findUserByUsername(username);
    if (!user) {
      logger.error(`Error during login: user not found!`);
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { userId: user?.id, username: user?.username, role: user?.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
    logger.info(`Logged in user with ID: ${username}`);

    res.json({ message: "Login successful", token });
  } catch (error) {
    logger.error(`Error during user login: ${error}!`);
    res.status(500).json({ message: "Server error" });
    return;
  }
};
