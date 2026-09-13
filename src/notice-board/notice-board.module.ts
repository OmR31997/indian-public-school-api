import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notice, NoticeSchema } from './schemas/notice.schema';
import { NoticeRepository } from './notice.repository';
import { NoticeBoardService } from './notice-board.service';
import { NoticeBoardController } from './notice-board.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Notice.name, schema: NoticeSchema }])],
  controllers: [NoticeBoardController],
  providers: [NoticeRepository, NoticeBoardService],
  exports: [NoticeBoardService, NoticeRepository],
})
export class NoticeBoardModule {}
