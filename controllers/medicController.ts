import { Request, Response } from "express";
import { getMedic, postMedic } from "../services/medic.service";
import { medicoSchema } from "../validators/medicoValidator";
import Joi from "joi";


export async function getMedicController(req: Request, res: Response) {
  try {
    const medics = await getMedic();
    res.status(200).json(medics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function postMedicController(req: Request, res: Response) {
    try {
    const { error, value } = medicoSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const newMedic = await postMedic(value);
    res.status(201).json(newMedic);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
