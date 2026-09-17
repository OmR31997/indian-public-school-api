import { Controller, Post, Body, Get, Patch, Delete, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('Authentication')
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login to authenticate and get JWT access token' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get profile details for currently authenticated user' })
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.userId);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('users')
  @ApiOperation({ summary: 'List all registered users with pagination, status, role, and search' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter users by status (ACTIVE, INACTIVE, SUSPENDED)' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter users by role' })
  async getUsers(
    @Query() queryDto: PaginationQueryDto = {},
    @Query('status') status?: string,
    @Query('role') role?: string,
  ) {
    return this.authService.findAllUsers(queryDto, status, role);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user account role and component access permissions' })
  async updateUser(@Param('id') id: string, @Body() updateDto: UpdateUserDto) {
    return this.authService.updateUser(id, updateDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user account (Super Admin accounts are protected)' })
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiOperation({ summary: 'Change password for currently authenticated user' })
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.userId, changePasswordDto);
  }
}

