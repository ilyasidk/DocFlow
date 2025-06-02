import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      const user = await UserModel.findOne({ username });
      if (!user) return res.status(401).json({ error: 'Неверный логин или пароль' });
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) return res.status(401).json({ error: 'Неверный логин или пароль' });
      
      if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET не задан в .env');
      
      // @ts-ignore - Bypassing type checking for jwt.sign
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
      );
      
      res.json({ 
        token, 
        user: { 
          id: user._id, 
          username: user.username, 
          role: user.role, 
          email: user.email, 
          name: user.name, 
          department: user.department 
        } 
      });
    } catch (err) {
      next(err);
    }
  }
} 