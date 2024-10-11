import { Module } from '@nestjs/common';
import { EquipmentController } from './equipment.controller';
import { EquipmentService } from './equipment.service';
import { EquipmentDatabaseModule } from '../..//libs/models/equipment/equipment-database.module';
@Module({
  imports: [
    EquipmentDatabaseModule
  ],
  controllers: [EquipmentController],
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule { }
