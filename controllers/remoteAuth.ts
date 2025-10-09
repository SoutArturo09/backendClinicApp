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
    // 1️⃣ Validar datos
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const { email, password } = value;

    // 2️⃣ Intentar crear usuario
    const { data, error: supaError } = await supabase.auth.signUp({
      email,
      password,
    });

    // 3️⃣ Manejo de error si el correo ya está registrado
    if (supaError) {
      if (supaError.message.includes('already registered')) {
        return res.status(409).json({
          msg: 'Este correo ya está registrado y confirmado. Intenta iniciar sesión.',
        });
      }
      return res.status(400).json({ msg: supaError.message });
    }

    // 4️⃣ Usuario creado correctamente, pendiente de confirmación
    return res.status(201).json({
      msg: 'Se ha enviado un correo de confirmación. Revisa tu email antes de iniciar sesión.',
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

    // 1️⃣ Iniciar sesión
    const { data, error: supaError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (supaError) return res.status(400).json({ msg: supaError.message });

    // 2️⃣ Si el usuario no ha confirmado su correo, bloquear acceso
    if (!data.user?.email_confirmed_at) {
      return res.status(403).json({
        msg: "Por favor, confirma tu correo antes de acceder.",
      });
    }

    // 3️⃣ Devolver token válido
    return res.json({
      id: data.user?.id,
      email: data.user?.email,
      token: data.session?.access_token,
    });
  } catch (err) {
    console.error("❌ Error en loginUser:", err);
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};