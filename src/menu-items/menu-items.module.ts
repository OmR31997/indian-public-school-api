import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuItem, MenuItemSchema } from './schemas/menu-item.schema';
import { MenuItemsController } from './menu-items.controller';
import { MenuItemsService } from './menu-items.service';
import { MenuItemsRepository } from './menu-items.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MenuItem.name, schema: MenuItemSchema }]),
  ],
  controllers: [MenuItemsController],
  providers: [MenuItemsService, MenuItemsRepository],
  exports: [MenuItemsService, MenuItemsRepository],
})
export class MenuItemsModule {}
