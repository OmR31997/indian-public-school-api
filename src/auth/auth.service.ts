import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { User } from './schemas/user.schema';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Seed or sync default admin
    const adminEmail = this.configService.get<string>(
      'DEFAULT_ADMIN_EMAIL',
      'admin@indianpublicschool.in',
    );
    const defaultPassword = this.configService.get<string>(
      'DEFAULT_ADMIN_PASSWORD',
      'Admin@123456',
    );
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    const existingAdmin = await this.userRepository.findByEmail(adminEmail);
    if (!existingAdmin) {
      await this.userRepository.create({
        email: adminEmail,
        name: 'Super Admin',
        passwordHash,
        role: 'Super Admin',
        allowedModules: ['*'],
        status: 'ACTIVE',
      });
    } else {
      await this.userRepository.update(existingAdmin.publicId, {
        passwordHash,
        role: 'Super Admin',
        allowedModules: ['*'],
        status: 'ACTIVE',
      });
    }
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.userRepository.findByEmail(registerDto.email);
    if (existing) {
      throw new ConflictException(
        `User with email "${registerDto.email}" already exists`,
      );
    }

    if (registerDto.role === 'Super Admin') {
      throw new ForbiddenException(
        'Only one primary Super Admin account is permitted in the system. Additional administrator accounts must be Sub Admins.',
      );
    }

    const role = 'Sub Admin';
    const allowedModules = registerDto.allowedModules || [];

    const passwordHash = await bcrypt.hash(registerDto.password, 10);
    const user = await this.userRepository.create({
      email: registerDto.email,
      name: registerDto.name,
      passwordHash,
      role,
      allowedModules,
      avatar: registerDto.avatar,
      status: 'ACTIVE',
    });

    const token = this.generateToken(user.publicId, user.email, user.role, user.name, user.allowedModules || []);

    return {
      user: {
        id: user.publicId,
        email: user.email,
        name: user.name,
        role: user.role,
        allowedModules: user.allowedModules,
        avatar: user.avatar,
        status: user.status,
      },
      accessToken: token,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    await this.userRepository.update(user.publicId, {
      lastLoginAt: new Date(),
    });
    const allowedModules = user.role === 'Super Admin' ? ['*'] : (user.allowedModules || []);
    const token = this.generateToken(user.publicId, user.email, user.role, user.name, allowedModules);

    return {
      user: {
        id: user.publicId,
        email: user.email,
        name: user.name,
        role: user.role,
        allowedModules,
        avatar: user.avatar,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
      },
      accessToken: token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    return {
      id: user?.publicId,
      email: user?.email,
      name: user?.name,
      role: user?.role,
      allowedModules: user?.allowedModules || (user?.role === 'Super Admin' ? ['*'] : []),
      avatar: user?.avatar,
      status: user?.status,
      lastLoginAt: user?.lastLoginAt,
    };
  }

  async findAllUsers(queryDto: PaginationQueryDto = {}, status?: string, role?: string) {
    const additionalFilter: Record<string, any> = {};
    if (status && status !== 'All') additionalFilter.status = status;
    if (role && role !== 'All') additionalFilter.role = role;
    return this.userRepository.findAll(queryDto, ['name', 'email', 'role', 'status'], additionalFilter);
  }

  async updateUser(userId: string, updateDto: UpdateUserDto) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    if (updateDto.role === 'Super Admin' && user.role !== 'Super Admin') {
      throw new ForbiddenException(
        'Only one primary Super Admin account is permitted in the system. Sub Admin accounts cannot be promoted to Super Admin.',
      );
    }

    const updates: Partial<User> = {};
    if (updateDto.name) updates.name = updateDto.name;
    if (updateDto.email) updates.email = updateDto.email;
    if (updateDto.avatar !== undefined) updates.avatar = updateDto.avatar;
    if (updateDto.status) updates.status = updateDto.status;
    if (updateDto.password) {
      updates.passwordHash = await bcrypt.hash(updateDto.password, 10);
    }

    if (user.role === 'Super Admin') {
      updates.role = 'Super Admin';
      updates.allowedModules = ['*'];
    } else {
      updates.role = 'Sub Admin';
      if (updateDto.allowedModules) {
        updates.allowedModules = updateDto.allowedModules;
      }
    }


    const updatedUser = await this.userRepository.update(userId, updates);
    return {
      id: updatedUser?.publicId,
      email: updatedUser?.email,
      name: updatedUser?.name,
      role: updatedUser?.role,
      allowedModules: updatedUser?.allowedModules,
      status: updatedUser?.status,
    };
  }

  async deleteUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
    if (user.role === 'Super Admin') {
      throw new ForbiddenException('Super Admin accounts cannot be deleted directly.');
    }
    await this.userRepository.delete(userId);
    return { message: 'User deleted successfully' };
  }

  private generateToken(
    userId: string,
    email: string,
    role: string,
    name?: string,
    allowedModules: string[] = ['*'],
  ): string {
    return this.jwtService.sign({
      sub: userId,
      email,
      role,
      name: name || email,
      allowedModules,
    });
  }
}

