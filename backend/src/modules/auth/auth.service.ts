import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../../config/database';
import config from '../../config/env';
import {
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
  ConflictError,
} from '../../common/errors/AppError';
import logger from '../../config/logger';

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * User login
   */
  async login(loginDto: LoginDto, ipAddress: string, userAgent: string): Promise<any> {
    const { email, password, rememberMe } = loginDto;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / (1000 * 60)
      );
      throw new UnauthorizedError(
        `Account is locked due to too many failed login attempts. Try again in ${minutesLeft} minutes.`
      );
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment failed login count
      const failedCount = user.failedLoginCount + 1;
      const updates: any = {
        failedLoginCount: failedCount,
      };

      // Lock account if max attempts reached
      if (failedCount >= config.MAX_LOGIN_ATTEMPTS) {
        updates.lockedUntil = new Date(
          Date.now() + config.LOCK_DURATION_MINUTES * 60 * 1000
        );
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updates,
      });

      throw new UnauthorizedError('Invalid credentials');
    }

    // Reset failed login count and update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokenPair(user.id, rememberMe);

    // Create session
    await this.createSession(user.id, tokens.accessToken, ipAddress, userAgent);

    // Log activity
    await this.logActivity(user.id, 'login', ipAddress, userAgent);

    // Extract permissions
    const permissions = user.roles.flatMap((ur) =>
      ur.role.permissions.map((rp) => rp.permission.slug)
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        roles: user.roles.map((ur) => ur.role.slug),
        permissions: [...new Set(permissions)],
      },
      tokens,
    };
  }

  /**
   * User registration
   */
  async register(registerDto: RegisterDto): Promise<any> {
    const { email, password, firstName, lastName, phone } = registerDto;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        phone,
      },
    });

    // Assign default role (user)
    const defaultRole = await prisma.role.findFirst({
      where: { slug: 'user' },
    });

    if (defaultRole) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: defaultRole.id,
        },
      });
    }

    logger.info(`New user registered: ${user.email}`);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as any;

      // Check if refresh token exists in database
      const tokenRecord = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      // Generate new token pair
      const tokens = await this.generateTokenPair(decoded.userId);

      // Delete old refresh token
      await prisma.refreshToken.delete({
        where: { token: refreshToken },
      });

      return tokens;
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  /**
   * Logout user
   */
  async logout(accessToken: string, refreshToken: string): Promise<void> {
    // Delete session
    await prisma.session.deleteMany({
      where: { token: accessToken },
    });

    // Delete refresh token
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, config.BCRYPT_ROUNDS);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    logger.info(`Password changed for user: ${user.email}`);
  }

  /**
   * Forgot password - send reset link
   */
  async forgotPassword(email: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if email exists
      return 'If the email exists, a password reset link has been sent';
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Store hashed token (you might want to add a passwordResetToken field to User model)
    // For now, we'll use a temporary solution
    
    logger.info(`Password reset requested for: ${user.email}`);

    // TODO: Send email with reset link containing resetToken

    return 'If the email exists, a password reset link has been sent';
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Hash the provided token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // TODO: Find user by reset token and validate expiry
    // For now, throw error
    throw new BadRequestError('Password reset functionality not fully implemented');
  }

  /**
   * Generate JWT token pair
   */
  private async generateTokenPair(
    userId: string,
    longExpiry: boolean = false
  ): Promise<TokenPair> {
    const accessToken = jwt.sign({ userId }, config.JWT_ACCESS_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRY,
    });

    const refreshToken = jwt.sign({ userId }, config.JWT_REFRESH_SECRET, {
      expiresIn: longExpiry ? '30d' : config.JWT_REFRESH_EXPIRY,
    });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (longExpiry ? 30 : 7));

    await prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  /**
   * Create user session
   */
  private async createSession(
    userId: string,
    token: string,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Match access token expiry

    await prisma.session.create({
      data: {
        userId,
        token,
        ipAddress,
        device: this.parseDevice(userAgent),
        browser: this.parseBrowser(userAgent),
        expiresAt,
      },
    });
  }

  /**
   * Log user activity
   */
  private async logActivity(
    userId: string,
    action: string,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        ipAddress,
        userAgent,
      },
    });
  }

  /**
   * Update current user profile details & credentials
   */
  async updateProfile(
    userId: string,
    data: { 
      firstName?: string; 
      lastName?: string; 
      email?: string; 
      phone?: string; 
      avatar?: string;
      password?: string;
    }
  ) {
    const updateData: any = {};

    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;

    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: userId },
        },
      });
      if (existingUser) {
        throw new ConflictError('Email address is already in use by another user');
      }
      updateData.email = data.email;
    }

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, config.BCRYPT_ROUNDS);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const permissions = updatedUser.roles.flatMap((ur) =>
      ur.role.permissions.map((rp) => `${rp.permission.module}.${rp.permission.action}`)
    );

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
      roles: updatedUser.roles.map((ur) => ur.role.slug),
      permissions: [...new Set(permissions)],
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt,
    };
  }

  private parseDevice(userAgent: string): string {
    if (/mobile/i.test(userAgent)) return 'Mobile';
    if (/tablet/i.test(userAgent)) return 'Tablet';
    return 'Desktop';
  }

  private parseBrowser(userAgent: string): string {
    if (/chrome/i.test(userAgent)) return 'Chrome';
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/safari/i.test(userAgent)) return 'Safari';
    if (/edge/i.test(userAgent)) return 'Edge';
    return 'Unknown';
  }
}

export default new AuthService();
