import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

class Point {
    @Prop({
        type: String,
        enum: ['Point'],
        required: true
    })
    type: 'Point';

    @Prop({
        type: [Number],
        required: true
    })
    coordinates: number[];
}

const PointSchema = SchemaFactory.createForClass(Point);

@Schema({
    _id: false,
    timestamps: false,
    versionKey: false
})
export class Location {
    @Prop()
    lat: number;

    @Prop()
    long: number;

    @Prop()
    title: string;

    @Prop()
    distance: number; //radius

    @Prop({
        type: PointSchema,
        required: false
    })
    point?: Point;

}

export const LocationSchema = SchemaFactory.createForClass(Location);
