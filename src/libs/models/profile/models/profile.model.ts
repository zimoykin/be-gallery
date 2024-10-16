import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ObjectId } from "mongoose";
import { Location, LocationSchema } from "./location.model";
import { Bucket, BucketSchema } from "./bucket.model";
import { Equipment, EquipmentSchema } from "./equipment.model";
import { ServiceCategory } from "../../offers/offer-category.enum";

@Schema({
  collection: 'gallery_profiles',
  timestamps: true,
  versionKey: false
})
export class Profile {
  _id: ObjectId;

  @Prop({
    required: true
  })
  userId: string;

  @Prop({
    required: true
  })
  name: string;

  @Prop({
    required: true
  })
  email: string;

  @Prop({
    type: () => LocationSchema,
    required: false
  })
  location?: Location;

  @Prop()
  bio?: string;

  @Prop()
  website?: string;

  @Prop()
  url?: string; //profile avatar

  @Prop()
  urlAvailableUntil?: Date; //profile avatar

  @Prop({
    required: true,
    type: Boolean,
    default: false
  })
  privateAccess: boolean;

  @Prop({
    type: () => BucketSchema,
    required: false
  })
  bucket?: Bucket;

  @Prop({
    type: () => EquipmentSchema,
    required: false
  })
  favoriteCamera?: Equipment;

  @Prop({
    type: () => EquipmentSchema,
    required: false
  })
  favoriteLens?: Equipment;

  @Prop({
    enum: ServiceCategory,
    type: [String],
    required: false
  })
  categories: ServiceCategory[];

}


export const ProfileSchema = SchemaFactory.createForClass(Profile)
  .index({ userId: 1 }, { unique: true })
  .index({ email: 1 }, { unique: true })
  .index({ 'location.point': '2dsphere' });

export type PhotoDocument = Profile & Document;

export default {
  schema: ProfileSchema,
  name: Profile.name,
};
