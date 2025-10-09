import { Request, Response } from 'express';
import supabase from '../config/supabase';
import Joi from 'joi';

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('cliente', 'empleado', 'admin').default('cliente'), // ✅ roles controlados
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(), // ❌ NO min(6)
});


export const registerUser = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Validación de datos
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const { email, password, role } = value;

    // 2️⃣ Crear usuario con confirmación de correo y rol seguro
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,           // ✅ requiere confirmar correo
      user_metadata: { role },        // ✅ rol seguro en metadata
    });

    if (createError) {
      if (createError.message.includes('A user with this email address has already been registered')) {
        return res.status(409).json({ msg: 'Este correo ya está registrado. INICIE SESIÓN O USE OTRO CORREO' });
      }
      return res.status(400).json({ msg: createError.message });
    }

    const user = data.user;

    // 3️⃣ Enviar correo de confirmación automáticamente
    await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: 'http://localhost:8081/sign-in'
    });

    // 4️⃣ Retornar respuesta al cliente
    return res.status(201).json({
      msg: 'Usuario creado correctamente. Se ha enviado un correo de confirmación.',
      user: {
        id: user?.id,
        email: user?.email,
        role,                       // ✅ extraído de user_metadata
      },
    });

  } catch (err) {
    return res.status(500).json({ msg: 'Error interno del servidor' });
  }
};


export const loginUser = async (req: Request, res: Response) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ msg: error.details[0].message });

    const { email, password } = value;

    const { data, error: supaError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if(supaError && supaError.message === 'Invalid login credentials') {
      return res.status(400).json({ msg: 'Usuario o contraseña incorrectos' }); // genérico
    }
    if (supaError) return res.status(400).json({ msg: supaError.message });
    

    if (!data.user?.email_confirmed_at) {
      return res.status(403).json({ msg: 'Por favor, confirma tu correo antes de acceder.' });
    }

    return res.json({
      id: data.user?.id,
      email: data.user?.email,
      role: data.user?.user_metadata?.role, // ✅ visible en token
      token: data.session?.access_token,
    });
  } catch (err) {
    res.status(500).json({ msg: 'Error interno del servidor' });
  }
};
