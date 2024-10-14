import { Injectable, Logger } from "@nestjs/common";
import { AmqpSender } from "src/libs/amqp/amqp.sender";
import { EquipmentFavoriteDto } from "src/libs/amqp/common/dtos/equipment.dto";
import { InjectSender } from "../../libs/amqp/decorators";
import { Equipment } from "../../libs/models/equipment/equipment.model";

@Injectable()
export class EquipmentSender {
    private readonly logger = new Logger(EquipmentSender.name);
    constructor(
        //@ts-ignore
        @InjectSender('favorite_equipment') private readonly sender: AmqpSender
    ) { }

    async sendEquipmentChanged(profileId: string, equipment: Equipment) {
        this.logger.debug(`sendEquipmentChanged ${equipment.id} to ${profileId}`);
        await this.sender.sendMessage<EquipmentFavoriteDto>({
            category: equipment.category,
            favorite: equipment.favorite,
            id: equipment.id,
            name: equipment.name,
            profileId: profileId
        });
    }
}