import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { success } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth',
};

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name } = req.body;
    const result = await authService.register(email, password, name);
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    return success(res, { user: result.user, accessToken: result.accessToken }, 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    return success(res, { user: result.user, accessToken: result.accessToken });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No refresh token' } });
    }
    const result = await authService.refresh(token);
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    return success(res, { accessToken: result.accessToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await authService.logout(token);
    }
    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
    return success(res, { message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.userId!);
    return success(res, user);
  } catch (err) {
    next(err);
  }
}
