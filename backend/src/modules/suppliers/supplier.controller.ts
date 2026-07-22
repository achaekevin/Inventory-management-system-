import { Response, NextFunction } from 'express';
import supplierService from './supplier.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';

export class SupplierController {
  // ==================== SUPPLIERS ====================

  async getSuppliers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        search: req.query.search as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        city: req.query.city as string,
        state: req.query.state as string,
        country: req.query.country as string,
      };

      const result = await supplierService.getSuppliers(filters);
      ResponseHandler.success(res, result.data, 'Suppliers retrieved successfully', result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getSupplierById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const supplier = await supplierService.getSupplierById(req.params.id);
      ResponseHandler.success(res, supplier, 'Supplier retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createSupplier(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const supplier = await supplierService.createSupplier(req.body, userId);
      ResponseHandler.created(res, supplier, 'Supplier created successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateSupplier(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const supplier = await supplierService.updateSupplier(req.params.id, req.body, userId);
      ResponseHandler.success(res, supplier, 'Supplier updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteSupplier(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      await supplierService.deleteSupplier(req.params.id, userId);
      ResponseHandler.success(res, null, 'Supplier deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restoreSupplier(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const supplier = await supplierService.restoreSupplier(req.params.id, userId);
      ResponseHandler.success(res, supplier, 'Supplier restored successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateSupplierRating(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { rating } = req.body;
      const supplier = await supplierService.updateSupplierRating(req.params.id, rating, userId);
      ResponseHandler.success(res, supplier, 'Supplier rating updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // ==================== CONTACTS ====================

  async getContactsBySupplier(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        search: req.query.search as string,
      };

      const result = await supplierService.getContactsBySupplier(req.params.supplierId, filters);
      ResponseHandler.success(res, result.data, 'Contacts retrieved successfully', result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getContactById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const contact = await supplierService.getContactById(req.params.id);
      ResponseHandler.success(res, contact, 'Contact retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createContact(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const contact = await supplierService.createContact(req.body, userId);
      ResponseHandler.created(res, contact, 'Contact created successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateContact(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const contact = await supplierService.updateContact(req.params.id, req.body, userId);
      ResponseHandler.success(res, contact, 'Contact updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteContact(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      await supplierService.deleteContact(req.params.id, userId);
      ResponseHandler.success(res, null, 'Contact deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new SupplierController();
