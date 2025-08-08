import { Router , Request , Response } from 'express';
import { AuthController } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: User created successfully. Returns user info and API key.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     api_key:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input or user already exists.
 */
router.post('/register', validateRegister, AuthController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful. Returns a JWT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   type: object   
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     api_key:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized.
 */
router.post('/login', validateLogin, AuthController.login);

/**
 * @swagger
 * /auth/refresh-api-key:
 *   post:
 *     summary: Refresh API key for authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API key refreshed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 api_key:
 *                   type: string
 *       401:
 *         description: Authentication required.
 */
router.post('/refresh-api-key', authenticateJWT, AuthController.refreshApiKey);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     api_key:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Authentication required.
 */
router.get('/profile', authenticateJWT, AuthController.getProfile);

export default router; 