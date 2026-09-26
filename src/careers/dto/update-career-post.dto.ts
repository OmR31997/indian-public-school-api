import { PartialType } from '@nestjs/swagger';
import { CreateCareerPostDto } from './create-career-post.dto';

export class UpdateCareerPostDto extends PartialType(CreateCareerPostDto) {}
