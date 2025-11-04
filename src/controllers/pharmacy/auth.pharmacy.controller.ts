import { Request, Response } from "express";
import { AuthPharmacyService } from "../../services/pharmacy/auth.pharmacy.service";

const authService = new AuthPharmacyService();

export class AuthPharmacyController {
  /**
   * Contrôleur pour la connexion utilisateur
   */
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    try {
      const result = await authService.login(email, password);
      if (!result) {
        return res.status(401).json({ message: "Identifiants invalides" });
      }
      // Définir le token dans un cookie HTTP-only
      res.cookie("pharmacy_token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // true en prod
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 24h
      });
      return res.status(200).json({ customer: result.customer });
    } catch (error) {
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  }
  /**
   * Contrôleur pour la déconnexion utilisateur
   */
  static logout(req: Request, res: Response) {
    res.clearCookie("pharmacy_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(200).json({ message: "Déconnexion réussie" });
  }
}
