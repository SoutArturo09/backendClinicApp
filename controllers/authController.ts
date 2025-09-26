import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/db';
import { generateToken } from '../utils/generateToken';
import { User } from '../models/userModel';
import Joi from 'joi';

// ✅ Validación con Joi
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'El correo no es válido',
    'any.required': 'El correo es obligatorio'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'La contraseña debe tener al menos 6 caracteres',
    'any.required': 'La contraseña es obligatoria'
  })
});

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validación
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      res.status(400).json({ msg: error.details[0].message });
      return;
    }

    const { email, password } = value as User;
    const normalizedEmail = email.trim();

    // Verificar si el email ya existe
    const [existing] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if ((existing as User[]).length > 0) {
      res.status(400).json({ msg: 'El correo ya está registrado' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result]: any = await db.query(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [normalizedEmail, hashedPassword]
    );

    const insertId = result.insertId;

    res.status(201).json({
      id: insertId,
      email: normalizedEmail,
      token: generateToken(insertId),
    });
  } catch (error) {
    console.error('❌ Error en registerUser:', error);
    res.status(500).json({ msg: 'Error interno del servidor' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validación básica con Joi
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      res.status(400).json({ msg: error.details[0].message });
      return;
    }

    const { email, password } = value as User;
    const normalizedEmail = email.toLowerCase().trim();

    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [normalizedEmail]
    );

    const users = rows as User[];

    if (users.length === 0) {
      res.status(400).json({ msg: 'Usuario o contraseña incorrectos' }); // genérico
      return;
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(400).json({ msg: 'Usuario o contraseña incorrectos' }); // genérico
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      token: generateToken(user.id!),
    });
  } catch (error) {
    console.error('❌ Error en loginUser:', error);
    res.status(500).json({ msg: 'Error interno del servidor' });
  }
};
