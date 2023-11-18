import { type TableName, type UserField } from './constants';

export interface Users {
  [UserField.Id]: string;
  [UserField.Email]: string;
  [UserField.PasswordHash]?: string | null;
  [UserField.Username]?: string | null;
  [UserField.FirstName]?: string | null;
  [UserField.LastName]?: string | null;
  [UserField.CreatedAt]: string;
  [UserField.UpdatedAt]?: string | null;
  [UserField.DeletedAt]?: string | null;
}

export interface Database {
  [TableName.Users]: Users;
}
