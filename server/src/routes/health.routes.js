import { Router } from 'express';
import mongoose from 'mongoose';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      {
        uptime: process.uptime(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      },
      'OK'
    )
  );
});

export default router;
