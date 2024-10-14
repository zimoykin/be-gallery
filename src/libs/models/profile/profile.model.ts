import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ObjectId } from "mongoose";

@Schema({
  _id: false,
  timestamps: false,
  versionKey: false
})
class Location {

  @Prop({
    required: true,
    type: Number,
  })
  lat: number;

  @Prop({
    required: true,
    type: Number,
  })
  long: number;

  @Prop({
    required: true,
    type: String
  })
  title: string;

  @Prop({
    required: true,
    type: Number
  })
  distance: number; //radius
}
const LocationSchema = SchemaFactory.createForClass(Location);

@Schema({
  _id: false,
  timestamps: false,
  versionKey: false
})
class Bucket {
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
}

const BucketSchema = SchemaFactory.createForClass(Bucket);

@Schema({
  _id: false,
  timestamps: false,
  versionKey: false
})
class Equipment {
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
    type: LocationSchema,
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
    type: BucketSchema,
    required: false
  })
  bucket?: Bucket;

  @Prop({
    type: EquipmentSchema,
    required: false
  })
  favoriteCamera?: Equipment;

  @Prop({
    type: EquipmentSchema,
    required: false
  })
  favoriteLens?: Equipment;

}


export const ProfileSchema = SchemaFactory.createForClass(Profile)
  .index({ userId: 1 }, { unique: true });

export type PhotoDocument = Profile & Document;

export default {
  schema: ProfileSchema,
  name: Profile.name,
};
