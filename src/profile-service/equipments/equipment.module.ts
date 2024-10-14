import { Module } from '@nestjs/common';
import { EquipmentController } from './equipment.controller';
import { EquipmentService } from './equipment.service';
import { EquipmentDatabaseModule } from '../..//libs/models/equipment/equipment-database.module';
import { AmqpModule } from '../../libs/amqp/amqp.module';
import { EquipmentSender } from './equipment.sender';
@Module({
  imports: [
    EquipmentDatabaseModule,
    AmqpModule.forFeature('favorite_equipment')
  ],
  controllers: [EquipmentController],
  providers: [EquipmentService, EquipmentSender],
  exports: [EquipmentService],
})
export class EquipmentModule { }
