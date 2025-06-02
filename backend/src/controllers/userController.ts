import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService.js';
import { UserRole } from '../models/User.js';

export class UserController {
  // Получить всех пользователей своей роли
  static async getUsersByRole(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error('Нет доступа');
      const { role } = req.user;
      const users = await UserService.getUsersByRole(role);
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  // Добавить пользователя
  static async addUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error('Нет доступа');
      const initiator = req.user;
      const user = await UserService.addUser(initiator, req.body);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }

  // Удалить пользователя
  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error('Нет доступа');
      const initiator = req.user;
      await UserService.deleteUser(initiator, req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  // Изменить пользователя (роль, username, пароль)
  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error('Нет доступа');
      const initiator = req.user;
      const user = await UserService.updateUser(initiator, req.params.id, req.body);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
} 