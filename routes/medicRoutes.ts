import { Router } from 'express';
import { getMedicController, postMedicController } from '../controllers/medicController';

const router = Router();

router.get('/get', getMedicController);
router.post('/post', postMedicController);

export default router;
