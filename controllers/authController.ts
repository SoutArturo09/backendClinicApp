import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/db';
import { generateToken } from '../utils/generateToken';
import { User } from '../models/userModel';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: User = req.body;

    if (!email || !password) {
      res.status(400).json({ msg: 'Campos obligatorios' });
      return;
    }

    // Verificar si el email ya existe
    const [existing] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if ((existing as User[]).length > 0) {
      res.status(400).json({ msg: 'Email ya registrado' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result]: any = await db.query(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );

    const insertId = result.insertId;

    res.status(201).json({
      id: insertId,
      email,
      token: generateToken(insertId),
    });
  } catch (error) {
    res.status(500).json({ msg: 'Error al registrar usuario', error: (error as Error).message });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: User = req.body;

    if (!email || !password) {
      res.status(400).json({ msg: 'Campos obligatorios' });
      return;
    }

    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    const users = rows as User[];

    if (users.length === 0) {
      res.status(400).json({ msg: 'Usuario no encontrado' });
      return;
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(400).json({ msg: 'Contraseña incorrecta' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      token: generateToken(user.id!),
    });
  } catch (error) {
    res.status(500).json({ msg: 'Error al iniciar sesión', error: (error as Error).message });
  }
};
