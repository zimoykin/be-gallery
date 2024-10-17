import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({
    _id: false,
    timestamps: false,
    versionKey: false
})
export class Bucket {
    @Prop({
        required: true,
        type: String,
    })
    url: string;

    @Prop({
        required: true,
        type: String,
    })
    key: string;

    @Prop({
        required: true,
        type: String,
    })
    bucketName: string;

    @Prop({
        required: true,
        type: String,
    })
    folder: string;

    @Prop({
        required: false,
        type: Number
    })
    height?: number;

    @Prop({
        required: false,
        type: Number
    })
    width?: number;
}

export const BucketSchema = SchemaFactory.createForClass(Bucket);