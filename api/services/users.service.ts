import { TableName, UserField } from '../database/constants';
import { type Users } from '../database/schema';
import { SqlService } from './sql.service';

export class UsersService extends SqlService<Users> {
  constructor() {
    super({
      table: TableName.Users,
      updatedAtColumn: UserField.UpdatedAt,
      deletedAtColumn: UserField.DeletedAt,
    });
  }
}

export const usersService = new UsersService();
