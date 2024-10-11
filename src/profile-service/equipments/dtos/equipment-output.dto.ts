import { Exclude, Expose } from 'class-transformer';
import { IsIn, IsString } from 'class-validator';

@Exclude()
export class EquipmentOutputDto {
  @Expose()
  id: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  favorite = 0; // 1 - true, 0 - false

  @Expose()
  @IsString()
  @IsIn(['camera', 'lens', 'other'])
  category: 'camera' | 'lens' | 'other';
}
