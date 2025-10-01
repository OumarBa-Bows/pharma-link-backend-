import { AppDataSource, logger } from "../../app";
import { getUserRepository } from "../../repository/userRepository";
import { Role } from "../../entities/Role.entity";
import { User } from "../../entities/User.entity";
import { getRoleRepository } from "../../repository/roleRepository";
import { In } from "typeorm";
import bcrypt from "bcryptjs";

export class UserService {
  // Créer un utilisateur
  static async createUser(data: any) {
    try {
      const { roles, password, ...userData } = data;
      const userRepo = getUserRepository();
      const roleRepo = getRoleRepository();

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Créer l'utilisateur (type-narrow to single User)
      const user: User = userRepo.create({
        ...(userData as Partial<User>),
        password: hashedPassword,
      });
      // Si des rôles sont passés → on les récupère et on les associe
      if (roles && roles.length > 0) {
        const foundRoles = await roleRepo.find({
          where: { name: In(roles) },
        });
        user.roles = foundRoles; // optionnel maintenant
      }

      const savedUser = await userRepo.save(user);
      // Exclure le mot de passe avant retour
      const { password: _, ...safeUser } = savedUser;
      return safeUser;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Mettre à jour un utilisateur
  static async updateUser(id: number, data: any) {
    try {
      const userRepo = getUserRepository();
      const existing = await userRepo.findOne({
        where: { id },
        relations: ["roles"],
      });
      if (!existing) {
        throw new Error("Utilisateur introuvable");
      }

      const { roles, ...rest } = data;
      Object.assign(existing, rest);
      const roleRepo = getRoleRepository();

      if (roles) {
        const foundRoles =
          roles.length > 0
            ? await roleRepo.find({ where: { name: In(roles) } })
            : [];
        existing.roles = foundRoles;
      }

      const saved = await userRepo.save(existing);
      return saved;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Supprimer un utilisateur
  static async deleteUser(id: number) {
    try {
      const userRepo = getUserRepository();
      const user = await userRepo.delete({ id });
      return user;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Récupérer tous les utilisateurs
  static async getAllUsers(page: number = 1, limit: number = 10) {
    try {
      const userRepo = getUserRepository();

      const [users, total] = await userRepo.findAndCount({
        skip: (page - 1) * limit, // décalage
        take: limit, // nombre d'éléments par page
        order: { id: "DESC" }, // optionnel : trier par id desc
      });

      return {
        users,
        meta: {
          total,
          page,
          lastPage: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Récupérer un utilisateur par ID
  static async getUserById(id: number) {
    try {
      const userRepo = getUserRepository();
      const user = await userRepo.findOne({
        where: { id },
        relations: ["roles"],
      });

      if (!user) {
        throw new Error("Utilisateur introuvable");
      }

      return user;
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
