import { Table } from 'src/dynamo-db/decorators/table.decorator';
import { Index } from '../../dynamo-db/decorators/index.decorator';
import { PrimaryKey } from '../../dynamo-db/decorators/primary-key.decorator';
import { SortKey } from '../../dynamo-db/decorators/sort-key.decorator';
import { Required } from '../../dynamo-db/decorators/required.decorator';

@Table(Photo.name)
export class Photo {
  @PrimaryKey()
  id: string;

  @Index('N')
  sortOrder: number;

  @Index('S')
  @Required()
  profileId: string;

  @SortKey('S')
  folderId: string;

  @Required()
  camera: string;

  lens?: string;
  iso?: string;
  film?: string;
  location?: string;
  description?: string;

  @Required()
  bucket: {
    bucketName: string;
    folder: string;
    url: string;
    key: string;
  };

  compressed?: {
    bucketName: string;
    folder: string;
    url: string;
    key: string;
  };

  preview?: {
    bucketName: string;
    folder: string;
    url: string;
    key: string;
    previewWidth: number;
    previewHeight: number;
  };

  @Index('N')
  privateAccess = 1; // 0: public, 1: private

  @Index('N')
  @Required()
  likes: number = 0;
}

export type PhotoData = Omit<Photo, 'id'>;
