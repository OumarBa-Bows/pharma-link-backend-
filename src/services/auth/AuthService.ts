import jwt from "jsonwebtoken";
import { UserData } from "../../interfaces/UserDto";
import { getUserRepository } from "../../repository/userRepository";
import bcrypt from "bcryptjs";

export class AuthService {
  /**
   * Génère un JWT pour l'utilisateur
   * @param payload Données à inclure dans le token (doit inclure le champ role)
   * @returns string (JWT)
   */
  generateToken(payload: { id: number; email: string; role: string }): string {
    const jwtSecretKey = process.env.SUPABASE_JWT_SECRET_KEY?.replace(
      /\n/g,
      "\n"
    );
    if (!jwtSecretKey) throw new Error("JWT secret key is missing");
    // Par défaut, expire dans 24h
    return jwt.sign(payload, jwtSecretKey, {
      algorithm: "HS256",
      expiresIn: "12h",
    });
  }
  /**
   * Authentifie un utilisateur par email et mot de passe
   * @param email string
   * @param password string
   * @returns UserData | null
   */
  async login(
    email: string,
    password: string
  ): Promise<{ user: UserData; token: string } | null> {
    const user = await getUserRepository().findOneBy({ email });
    if (!user) return null;
    // Vérification du mot de passe hashé avec bcryptjs
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;
    const { id, name, email: userEmail, createdAt, updatedAt } = user;
    // À adapter selon votre logique de rôle
    const role = (user as any).role || "user";
    const token = this.generateToken({ id, email: userEmail, role });
    return {
      user: { id, name, email: userEmail, createdAt, updatedAt },
      token,
    };
  }
}
