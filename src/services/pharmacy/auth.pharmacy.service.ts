import jwt from "jsonwebtoken";
import { CustomerDto } from "../../interfaces/CustomerDto";
import { getCustomerRepository } from "../../repository/customerRepository";
import bcrypt from "bcryptjs";
import { Customer } from "../../entities/Customer.entity";

export class AuthPharmacyService {
  /**
   * Génère un JWT pour l'utilisateur
   * @param payload Données à inclure dans le token (doit inclure le champ role)
   * @returns string (JWT)
   */
  generateToken(payload: { id: number; email: string; role?: string }): string {
    const jwtSecretKey = process.env.PHARMACY_JWT_SECRET_KEY?.replace(
      /\n/g,
      "\n"
    );
    if (!jwtSecretKey) throw new Error("JWT secret key is missing");
    // Par défaut, expire dans 24h
    return jwt.sign(payload, jwtSecretKey, {
      algorithm: "HS256",
      expiresIn: "24h",
    });
  }
  /**
   * Authentifie un utilisateur par email et mot de passe
   * @param email string
   * @param password string
   * @returns CustomerDto | null
   */
  async login(
    email: string,
    password: string
  ): Promise<{ customer: CustomerDto; token: string } | null> {
    const customer = await getCustomerRepository().findOne({
      where: { email },
      withDeleted: false,
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        password: true, // explicitly select hidden field
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!customer) return null;
    // Vérification du mot de passe hashé avec bcryptjs
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) return null;
    const {
      id,
      name,
      email: customerEmail,
      status,
      createdAt,
      updatedAt,
    } = customer;
    // Récupérer les rôles de l'utilisateur

    // Ne pas ajouter de rôle par défaut si aucun rôle n'est trouvé
    let tokenPayload: { id: number; email: string; status: string } = {
      id,
      email: customerEmail,
      status,
    };

    const token = this.generateToken(tokenPayload);
    return {
      customer: {
        id,
        name,
        email: customerEmail,
        status: customer.status,
      },
      token,
    };
  }

  async createPharmacyCustomer(data: any) {
    try {
      const { password, ...customerData } = data;
      const customerRepo = getCustomerRepository();
      const hashedPassword = await bcrypt.hash(password, 10);
      const newCustomer = customerRepo.create({
        ...(customerData as Partial<Customer>),
        password: hashedPassword,
      });
      const savedCustomer = await customerRepo.save(newCustomer);
      const { password: _, ...safeCustomer } = savedCustomer;
      return safeCustomer;
    } catch (error) {
      throw new Error("Error creating pharmacy customer");
    }
  }
  async findCustomerByEmail(email: string) {
    return await getCustomerRepository().findOne({
      where: { email },
      withDeleted: false,
    });
  }
}
