import { IUser } from '../../models/User.js';

// Define Multer types directly since we're having import issues
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      file?: MulterFile;
    }
    
    namespace Multer {
      interface File extends MulterFile {}
    }
  }
}

// This needs to be an actual export to be recognized as a module
export {}; 