import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

class Bucket {
  @Prop()
  bucketName: string;
  @Prop()
  folder: string;
  @Prop()
  url: string;

  @Prop()
  key: string;

  @Prop()
  width?: number;

  @Prop()
  height?: number;
}
const BucketSchema = SchemaFactory.createForClass(Bucket);

@Schema({
  timestamps: true,
  collection: 'gallery_photos',
  versionKey: false,
})
export class PhotoModel {

  _id: string;
  @Prop()
  sortOrder: number;

  @Prop({ required: true })
  profileId: string;

  @Prop({ required: true })
  folderId: string;

  @Prop({ required: true })
  camera: string;

  @Prop({ required: false })
  lens?: string;

  @Prop({ required: false })
  iso?: string;

  @Prop({ required: false })
  film?: string;

  @Prop({ required: false })
  location?: string;

  @Prop({ required: true })
  description?: string;

  //preview
  @Prop({ required: false, schema: BucketSchema })
  preview?: Bucket;

  @Prop({ required: false })
  previewUrl?: string;

  @Prop({ required: false })
  previewUrlAvailableUntil?: number;

  //compressed
  @Prop({ required: false, schema: BucketSchema })
  compressed?: Bucket;

  @Prop({ required: false })
  compressedUrl?: string;

  @Prop({ required: false })
  compressedUrlAvailableUntil?: number;

  @Prop({ required: false, schema: BucketSchema })
  original: Bucket;

  @Prop({ required: false })
  originalUrl?: string;

  @Prop({ required: false })
  originalUrlAvailableUntil?: number;

  @Prop({ required: false, default: 0 })
  privateAccess: number; // 0: public, 1: private

  @Prop({ required: false, default: 0 })
  likes: number = 0;
}

export type PhotoDocument = PhotoModel & Document;
export const PhotoSchema = SchemaFactory.createForClass(PhotoModel);


export default {
  schema: PhotoSchema,
  name: PhotoModel.name,
};
