import { AppDataSource } from "../../configs/data-source";
import { Pharmacy } from "../../entities/Pharmacy.entity";
import { Command } from "../../entities/Command.entity";
import { PharmacyState } from "../../enums/PharmacyState.enum";

export interface DashboardTotals {
  totalPharmacies: number;
  activePharmacies: number;
  pendingPharmacies: number;
  blockedPharmacies: number;
}

export interface DashboardOrderItem {
  id: number;
  code: string;
  pharmacy: string;
  status: string;
  date: string;
}

export interface DashboardPharmacyItem {
  id: string;
  name: string;
  zone: string;
  state: PharmacyState;
  createdAt: string;
}

export interface DashboardSummary {
  totals: DashboardTotals;
  recentOrders: DashboardOrderItem[];
  recentPharmacies: DashboardPharmacyItem[];
}

export class DashboardService {
  static async getSummary(): Promise<DashboardSummary> {
    const pharmacyRepo = AppDataSource.getRepository(Pharmacy);
    const commandRepo = AppDataSource.getRepository(Command);

    const [totalPharmacies, activePharmacies, pendingPharmacies, blockedPharmacies] = await Promise.all([
      pharmacyRepo.count(),
      pharmacyRepo.count({ where: { state: PharmacyState.ACTIVE } }),
      pharmacyRepo.count({ where: { state: PharmacyState.PENDING } }),
      pharmacyRepo.count({ where: { state: PharmacyState.BLOCKED } }),
    ]);

    const recentPharmaciesRaw = await pharmacyRepo.find({
      relations: ["zone"],
      order: { createdAt: "DESC" },
      take: 5,
    });

    const recentPharmacies: DashboardPharmacyItem[] = recentPharmaciesRaw.map((p) => ({
      id: p.id,
      name: p.name,
      zone: p.zone?.name || "",
      state: p.state,
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : "",
    }));

    const recentOrdersRaw = await commandRepo.find({
      relations: ["pharmacy"],
      order: { date: "DESC" },
      take: 5,
    });

    const recentOrders: DashboardOrderItem[] = recentOrdersRaw.map((c) => ({
      id: c.id,
      code: c.code,
      pharmacy: c.pharmacy?.name || "",
      status: String(c.status),
      date: c.date ? new Date(c.date).toISOString() : "",
    }));

    return {
      totals: {
        totalPharmacies,
        activePharmacies,
        pendingPharmacies,
        blockedPharmacies,
      },
      recentOrders,
      recentPharmacies,
    };
  }
}
