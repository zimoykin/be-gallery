import { Module } from "@nestjs/common";
import { DynamodbModule } from "../../../../libs/dynamo-db";
import { Equipment } from "./equipment.model";
import { EquipmentRepository } from "./equipment.repository";

@Module({
    imports: [
        DynamodbModule.forFeature(Equipment),
    ],
    providers: [EquipmentRepository],
    exports: [EquipmentRepository],
})
export class EquipmentDatabaseModule { }