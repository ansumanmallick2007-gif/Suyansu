import { Router, Response } from 'express';
import { db, UserRole, DepartmentType } from '../db.js';
import {
  registerSchema,
  loginSchema,
  generateToken,
  hashPassword,
  comparePassword,
  requireAuth,
  AuthenticatedRequest
} from '../auth.js';

const router = Router();

// Register new user
router.post('/register', async (req, res: Response) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.issues.map((e: any) => e.message)
      });
    }

    const { name, email, password, department, role } = parseResult.data;

    const existing = await db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'A user with this email address already exists.' });
    }

    const password_hash = await hashPassword(password);
    const assignedRole: UserRole = role || 'employee';

    const newUser = await db.createUser({
      name,
      email,
      password_hash,
      role: assignedRole,
      department: department as DepartmentType
    });

    await db.createAuditLog({
      user_id: newUser.id,
      user_name: newUser.name,
      action: 'USER_REGISTERED',
      details: { email: newUser.email, role: newUser.role, department: newUser.department }
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        avatar_url: newUser.avatar_url
      }
    });
  } catch (err: any) {
    console.error('[Register Error]', err);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login user
router.post('/login', async (req, res: Response) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.issues.map((e: any) => e.message)
      });
    }

    const { email, password } = parseResult.data;
    const user = await db.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    await db.createAuditLog({
      user_id: user.id,
      user_name: user.name,
      action: 'USER_LOGIN',
      details: { role: user.role, department: user.department }
    });

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar_url: user.avatar_url
      }
    });
  } catch (err: any) {
    console.error('[Login Error]', err);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

// Get current user profile
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { password_hash, ...safeUser } = req.user;
  return res.json({ user: safeUser });
});

// List enterprise team members
router.get('/users', requireAuth, async (_req, res: Response) => {
  try {
    const users = await db.getAllUsers();
    return res.json({ users });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

export default router;
