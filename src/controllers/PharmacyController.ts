import { Request, Response } from 'express';
import { logger } from '../app';
import { PharmacyService } from '../services/pharmacies/PharmacyService';

export class PharmacyController {
  static async getAllPharmacies(req: Request, res: Response) {
      try {
          const pharmacies = await PharmacyService.getAllPharmacies();
          return res.status(200).send({
              success: true,
              message: "Pharmacies retrieved successfully",
              data: { pharmacies },
          });
      } catch (error:any) {
          console.error("Error getting pharmacies: ", error);
          return res.status(500).send({
              success: false,
              message: error.message || "Error getting pharmacies",
          });
      }
  }
    
    
      // Get paginated list of pharmacies with search
  static getPaginated = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';

      const result = await PharmacyService.getPaginatedPharmacies(page, limit, search);
      
      return res.status(200).send({
        success: true,
        message: 'Pharmacies retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error('Error getting pharmacies: ', error);
      return res.status(500).send({
        success: false,
        message: error.message || 'Error getting pharmacies',
      });
    }
  };
  
    // Get pharmacy by ID
  static getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const pharmacy = await PharmacyService.getPharmacyById(id);
      
      if (!pharmacy) {
        return res.status(404).send({
          success: false,
          message: 'Pharmacy not found',
        });
      }

      return res.status(200).send({
        success: true,
        message: 'Pharmacy retrieved successfully',
        data: { pharmacy },
      });
    } catch (error: any) {
      logger.error('Error getting pharmacy: ', error);
      return res.status(500).send({
        success: false,
        message: error.message || 'Error getting pharmacy',
      });
    }
  };

  static async getPharmacyById(req: Request, res: Response) {
      try {
          const { id } = req.params;
          const pharmacy = await PharmacyService.getPharmacyById(id);
          return res.status(200).send({
              success: true,
              message: "Pharmacy retrieved successfully",
              data: { pharmacy },
          });
      } catch (error:any) {
          console.error("Error getting pharmacy: ", error);
          return res.status(500).send({
              success: false,
              message: error.message || "Error getting pharmacy",
          });
      }
  }


    // Create new pharmacy
  static create = async (req: Request, res: Response) => {
    try {
      const pharmacy = await PharmacyService.createPharmacy(req.body);
      return res.status(201).send({
        success: true,
        message: 'Pharmacy created successfully',
        data: { pharmacy },
      });
    } catch (error: any) {
      logger.error('Error creating pharmacy: ', error);
      return res.status(500).send({
        success: false,
        message: error.message || 'Error creating pharmacy',
      });
    }
  };

  // Update pharmacy
  static update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const pharmacy = await PharmacyService.updatePharmacy(id, req.body);
      
      if (!pharmacy) {
        return res.status(404).send({
          success: false,
          message: 'Pharmacy not found',
        });
      }

      return res.status(200).send({
        success: true,
        message: 'Pharmacy updated successfully',
        data: { pharmacy },
      });
    } catch (error: any) {
      logger.error('Error updating pharmacy: ', error);
      return res.status(500).send({
        success: false,
        message: error.message || 'Error updating pharmacy',
      });
    }
  };

  // Delete pharmacy
  static delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await PharmacyService.deletePharmacy(id);
      
      if (!result) {
        return res.status(404).send({
          success: false,
          message: 'Pharmacy not found',
        });
      }

      return res.status(200).send({
        success: true,
        message: 'Pharmacy deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error deleting pharmacy: ', error);
      return res.status(500).send({
        success: false,
        message: error.message || 'Error deleting pharmacy',
      });
    }
  };

}