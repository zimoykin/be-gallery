export interface IEquipment {
  id: string;
  profileId: string;
  name: string;
  favorite: number;
  category: 'camera' | 'lens' | 'other';
}

export type EquipmentInput = Omit<IEquipment, 'id' | 'profileId'> 