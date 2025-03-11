import pool from "../utils/db";
import bcrypt from "bcryptjs";

export interface User {
  id: number;
  username: string;
  password: string;
  role: string;
}

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
