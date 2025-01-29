import { RoleService } from '../services/roleService';
import { Request, Response } from 'express';
import { z } from 'zod';
import { deleteRoleSchema, roleSchema } from '../validators';
import { formatZodError } from '../helpers';

export class RolesController {
  public static async getAllRoles(req: Request, res: Response) {
    try {
      const roles = await RoleService.getAllRoles();
      res.status(200).json(roles);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async createRole(req: Request, res: Response) {
    try {
      const role = roleSchema.parse(req.body);

      const existingRole = await RoleService.getRoleByName(role.name);
      if (existingRole) {
        res.status(400).json({ message: 'Role already exists' });
      }

      const createdRole = await RoleService.createRole(role);
      res.status(201).json({ message: 'Role created successfully', role: createdRole });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: `Validation error: ${formatZodError(error)}` });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async deleteRole(req: Request, res: Response) {
    try {
      const { id } = deleteRoleSchema.parse(req.params);

      const roleId = parseInt(id);
      const result = await RoleService.deleteRole(roleId);
      res.status(result.status).json({ message: result.message });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: `Validation error: ${formatZodError(error)}` });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
