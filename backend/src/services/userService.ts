import { UserModel, IUser, UserRole, Department } from '../models/User.js';
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export class UserService {
  // Получить всех пользователей, если админ или директор, или только своей роли для других
  static async getUsersByRole(role: UserRole): Promise<IUser[]> {
    if (role === UserRole.ADMIN || role === UserRole.DIRECTOR) {
      // Admin or Director gets all users
      return UserModel.find();
    }
    // Others only get users of their own role
    return UserModel.find({ role });
  }

  // Добавить пользователя (только если инициатор admin или директор)
  static async addUser(initiator: IUser, userData: { username: string; password: string; name: string; email: string; role: UserRole; department: Department; avatar?: string }): Promise<IUser> {
    if (initiator.role !== UserRole.ADMIN && initiator.role !== UserRole.DIRECTOR) {
      throw new Error('Нет прав на добавление пользователей');
    }
    const passwordHash = await bcrypt.hash(userData.password, 10);
    return UserModel.create({
      ...userData,
      passwordHash,
    });
  }

  // Удалить пользователя (только если инициатор admin или директор)
  static async deleteUser(initiator: IUser, userId: string): Promise<void> {
    if (initiator.role !== UserRole.ADMIN && initiator.role !== UserRole.DIRECTOR) {
      throw new Error('Нет прав на удаление пользователей');
    }
    await UserModel.findByIdAndDelete(userId);
  }

  // Изменить роль, username или пароль пользователя (только если инициатор admin или директор)
  static async updateUser(initiator: IUser, userId: string, update: { role?: UserRole; username?: string; password?: string }): Promise<IUser | null> {
    if (initiator.role !== UserRole.ADMIN && initiator.role !== UserRole.DIRECTOR) {
      throw new Error('Нет прав на изменение пользователя');
    }
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('Пользователь не найден');
    if (update.role) user.role = update.role;
    if (update.username) user.username = update.username;
    if (update.password) user.passwordHash = await bcrypt.hash(update.password, 10);
    await user.save();
    return user;
  }

  // Получить пользователя по id
  static async getUserById(userId: string): Promise<IUser | null> {
    return UserModel.findById(userId);
  }
} 