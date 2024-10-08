import { Module } from '@nestjs/common';
import { EquipmentController } from './equipment.controller';
import { EquipmentService } from './equipment.service';
import { DynamodbModule } from 'src/dynamo-db/dynamo-db.module';
import { Equipment } from './models/equipment.model';
import { profiles } from 'src/profiles/models/profile.seed';
import { equipments } from './models/equipment.seed';
@Module({
  imports: [
    DynamodbModule.forFeature(Equipment, {
      seeding() {
        return profiles
          .map((profile) => {
            return equipments.map((equipment) => {
              return {
                ...equipment,
                profileId: profile.id,
              } as Equipment;
            });
          })
          .flat();
      },
    }),
  ],
  controllers: [EquipmentController],
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule {}
