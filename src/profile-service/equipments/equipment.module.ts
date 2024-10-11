import { Module } from '@nestjs/common';
import { EquipmentController } from './equipment.controller';
import { EquipmentService } from './equipment.service';
import { Equipment } from './models/equipment.model';
import { DynamodbModule } from 'src/libs/dynamo-db';
@Module({
  imports: [
    DynamodbModule.forFeature(Equipment),
  ],
  controllers: [EquipmentController],
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule { }
