import { Request, Response } from "express";
import { AuthPharmacyService } from "../../services/pharmacy/auth.pharmacy.service";

const authService = new AuthPharmacyService();

export class AuthPharmacyController {
  static async createPharmacyCustomer(req: Request, res: Response) {
    const body = req.body;
    try {
      const existingCustomer = await authService.findCustomerByEmail(
        body.email
      );
      if (existingCustomer) {
        return res
          .status(400)
          .json({ success: false, message: "Email déjà utilisé" });
      }
      const customer = await authService.createPharmacyCustomer(body);
      return res
        .status(201)
        .json({ success: true, message: "Inscription réussie", customer });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Erreur serveur", error });
    }
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    try {
      const result = await authService.login(email, password);
      if (!result) {
        return res
          .status(401)
          .json({ success: false, message: "Identifiants invalides" });
      }
      // Définir le token dans un cookie HTTP-only
      return res.status(200).json({
        success: true,
        customer: result.customer,
        accessToken: result.token,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Erreur serveur", error });
    }
  }
}
