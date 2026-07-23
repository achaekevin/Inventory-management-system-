import { Response, NextFunction } from 'express';
import customerService from './customer.service';
import { ResponseHandler } from '../../common/utilities/response';
import { AuthRequest } from '../../common/middleware/authenticate';

export class CustomerController {
  // ==================== CUSTOMERS ====================

  async getCustomers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        search: req.query.search as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        customerType: req.query.customerType as 'individual' | 'business' | undefined,
        city: req.query.city as string,
        state: req.query.state as string,
        country: req.query.country as string,
      };

      const result = await customerService.getCustomers(filters);
      ResponseHandler.success(res, result.data, 'Customers retrieved successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getCustomerById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = (req.params as any).id;
      const customer = await customerService.getCustomerById(customerId);
      ResponseHandler.success(res, customer, 'Customer retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createCustomer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const customer = await customerService.createCustomer(req.body, userId);
      ResponseHandler.created(res, customer, 'Customer created successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateCustomer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const customerId = (req.params as any).id;
      const customer = await customerService.updateCustomer(customerId, req.body, userId);
      ResponseHandler.success(res, customer, 'Customer updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteCustomer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const customerId = (req.params as any).id;
      await customerService.deleteCustomer(customerId, userId);
      ResponseHandler.success(res, null, 'Customer deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restoreCustomer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const customerId = (req.params as any).id;
      const customer = await customerService.restoreCustomer(customerId, userId);
      ResponseHandler.success(res, customer, 'Customer restored successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateLoyaltyPoints(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const customerId = (req.params as any).id;
      const { points, operation } = req.body;
      const customer = await customerService.updateLoyaltyPoints(customerId, points, operation, userId);
      ResponseHandler.success(res, customer, 'Loyalty points updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getCustomerPurchaseSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = (req.params as any).id;
      const summary = await customerService.getCustomerPurchaseSummary(customerId);
      ResponseHandler.success(res, summary, 'Purchase summary retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ==================== ADDRESSES ====================

  async getAddressesByCustomer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = (req.params as any).customerId;
      const filters = {
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        search: req.query.search as string,
      };

      const result = await customerService.getAddressesByCustomer(customerId, filters);
      ResponseHandler.success(res, result.data, 'Addresses retrieved successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getAddressById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const addressId = (req.params as any).id;
      const address = await customerService.getAddressById(addressId);
      ResponseHandler.success(res, address, 'Address retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createAddress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const address = await customerService.createAddress(req.body, userId);
      ResponseHandler.created(res, address, 'Address created successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateAddress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const addressId = (req.params as any).id;
      const address = await customerService.updateAddress(addressId, req.body, userId);
      ResponseHandler.success(res, address, 'Address updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteAddress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const addressId = (req.params as any).id;
      await customerService.deleteAddress(addressId, userId);
      ResponseHandler.success(res, null, 'Address deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new CustomerController();
