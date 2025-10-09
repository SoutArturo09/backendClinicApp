import { Request, Response, NextFunction } from "express";
import supabase from "../config/supabase";

export const verifyAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "Token faltante" });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ msg: "Token inválido o expirado" });
    }

    // Agregamos el usuario a la request tipada
    (req as any).user = data.user;

    next();
  } catch (err) {
    console.error("❌ Error en verifyAuth:", err);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};
