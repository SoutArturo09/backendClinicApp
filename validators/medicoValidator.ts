import Joi from "joi";

export const medicoSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).required(),
});
