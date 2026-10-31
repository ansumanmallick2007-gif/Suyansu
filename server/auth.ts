import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db, User, UserRole, DepartmentType } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'synapse_enterprise_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = '24h';

// Zod schemas as specified in requirements
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  department: z.enum(['finance', 'hr', 'engineering', 'operations', 'product']),
  role: z.enum(['admin', 'manager', 'employee']).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  department: DepartmentType;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * Generate a JWT token with 24h expiration
 */
export function generateToken(user: User): string {
  const payload: AuthTokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    department: user.department,
    name: user.name
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Hash password with bcrypt salt rounds = 12
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

/**
 * Compare plain password against hash
 */
export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Authentication Middleware: extracts Bearer token, verifies JWT, attaches user
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Missing or malformed token.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;

    const user = await db.findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User associated with this token no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

/**
 * Role-Based Access Control (RBAC) middleware
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Action requires one of [${allowedRoles.join(', ')}] roles. Your role is '${req.user.role}'.`
      });
    }

    next();
  };
}
