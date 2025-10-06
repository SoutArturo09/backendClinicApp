import { Request, Response } from 'express';
import supabase  from '../config/supabase';
import Joi from 'joi';

// Validación con Joi
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const { email, password } = value;

    const { data, error: supaError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (supaError) return res.status(400).json({ msg: supaError.message });

    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    res.status(201).json({
      id: data.user?.id,
      email: data.user?.email,
    });
  } catch (err) {
    console.error('❌ Error en registerUser:', err);
    res.status(500).json({ msg: 'Error interno del servidor' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const { email, password } = value;

    const { data, error: supaError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (supaError) return res.status(400).json({ msg: supaError.message });

    res.json({
      id: data.user?.id,
      email: data.user?.email,
      token: data.session?.access_token,
    });
  } catch (err) {
    console.error('❌ Error en loginUser:', err);
    res.status(500).json({ msg: 'Error interno del servidor' });
  }
};