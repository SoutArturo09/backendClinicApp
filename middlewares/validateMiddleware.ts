import { Request, Response, NextFunction } from "express";

export const verifyRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const role = user?.user_metadata?.role;
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ msg: 'Acceso denegado: rol no autorizado' });
    }
    next();
  };
};
