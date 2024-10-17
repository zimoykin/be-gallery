import * as luxon from 'luxon';
import { ServiceCategory } from './offer-category.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Bucket, BucketSchema } from './bucket.model';
import { Location, LocationSchema } from './location.model';

@Schema({
  collection: 'gallery_offers',
  timestamps: true,
  versionKey: false
})
export class Offer {
  _id: Types.ObjectId;

  @Prop({
    required: true,
    type: String
  })
  profileId: string;

  @Prop({
    required: true,
    type: String
  })
  title: string;

  @Prop({
    required: true,
    type: String
  })
  description: string; //Markdown

  @Prop({
    required: true,
    type: Number
  })
  price: number;


  @Prop({
    required: false,
    type: BucketSchema
  })
  preview?: Bucket;

  @Prop({
    required: false,
    type: String
  })
  previewUrl?: string;

  @Prop({
    required: false,
    type: String
  })
  previewExpriredAt?: number;


  @Prop({
    required: false,
    type: BucketSchema
  })
  compressed?: Bucket;

  @Prop({
    required: false,
    type: String
  })
  compressedUrl?: string;

  @Prop({
    required: false,
    type: String
  })
  compressedExpriredAt?: number;

  //services in the offer
  @Prop({
    required: false,
    type: [String]
  })
  categories?: ServiceCategory[];

  @Prop({
    required: false,
    type: Boolean
  })
  privateAccess: boolean;

  @Prop({
    required: false,
    type: [Date]
  })
  availableUntil: Date;


  @Prop({
    type: () => LocationSchema,
    required: false
  })
  location?: Location;
}


export const OfferSchema = SchemaFactory.createForClass(Offer)
  .index({ profileId: 1 })
  .index({ 'location.point': '2dsphere' });