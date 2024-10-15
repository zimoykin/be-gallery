import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({
    _id: false,
    timestamps: false,
    versionKey: false
})
export class Equipment {
    @Prop({
        required: true,
        type: String,
    })
    id: string;

    @Prop({
        required: true,
        type: String,
    })
    profileId: string;

    @Prop({
        required: true,
        type: String,
    })
    name: string;

    @Prop({
        required: true,
        type: String,
    })
    favorite: number;

    @Prop({
        required: true,
        type: String,
    })
    category: 'camera' | 'lens' | 'other';

}

export const EquipmentSchema = SchemaFactory.createForClass(Equipment);
