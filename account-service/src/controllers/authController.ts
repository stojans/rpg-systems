import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../entities/user";
import pool from "../utils/db";

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await getUsers();
    res.status(201).json({ users });
  } catch (error) {
    console.error("Error during users fetching:", error);
    res.status(500).json({ message: "Server error" });
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
    res.status(400).json({ message: "Username and password are required" });
    return;
  }

  try {
    const user = await createUser(username, password, role);
    res.status(201).json({ message: "User created", user });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ message: "Server error" });
    return;
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  console.log("LOGIN HIT");

  if (!username || !password) {
    res.status(400).json({ message: "Username and password are required" });
    return;
  }

  try {
    const user: User | null = await findUserByUsername(username);
    if (!user) {
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

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error during user login:", error);
    res.status(500).json({ message: "Server error" });
    return;
  }
};
