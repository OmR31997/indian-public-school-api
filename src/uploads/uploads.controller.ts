import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Uploads')
@Controller('v1/uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload file to S3 / Local storage and record in media gallery' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        album: { type: 'string', nullable: true },
        altText: { type: 'string', nullable: true },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('album') album?: string,
    @Body('folder') folder?: string,
    @Body('altText') altText?: string,
  ) {
    return this.uploadsService.upload(file, album, altText, folder);
  }

  @Get('cloudinary-resources')
  @ApiOperation({ summary: 'List direct Cloudinary CDN storage resources' })
  @ApiQuery({ name: 'folder', required: false, type: String, description: 'Filter Cloudinary assets by folder path' })
  getCloudinaryResources(@Query('folder') folder?: string) {
    return this.uploadsService.getCloudinaryResources(folder);
  }

  @Get()
  @ApiOperation({ summary: 'List uploaded assets with pagination, search, and filtering' })
  @ApiQuery({ name: 'eventType', required: false, type: String, description: 'Filter gallery assets by event type' })
  findAll(
    @Query() queryDto: PaginationQueryDto = {},
    @Query('eventType') eventType?: string,
  ) {
    return this.uploadsService.findAll(queryDto, eventType);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset details by ID' })
  findOne(@Param('id') id: string) {
    return this.uploadsService.findOne(id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete file from cloud/local storage and database' })
  remove(@Param('id') id: string) {
    return this.uploadsService.remove(id);
  }
}
