import bcrypt from 'bcryptjs';
import { UserModel, UserRole, Department } from '../models/User.js';

/**
 * Инициализация администратора при первом запуске приложения
 */
export const seedAdminUser = async (): Promise<void> => {
  try {
    const adminExists = await UserModel.findOne({ role: UserRole.ADMIN });
    
    if (!adminExists) {
      // Создаем администратора по умолчанию
      const passwordHash = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD || 'admin123', 10);
      
      await UserModel.create({
        name: 'Администратор',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        department: Department.MANAGEMENT,
        username: 'admin',
        passwordHash,
      });
      
      console.log('👤 Администратор по умолчанию создан');
    }
  } catch (error) {
    console.error('❌ Ошибка при инициализации администратора:', error);
  }
}; 