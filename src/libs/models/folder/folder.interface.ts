export interface IFolder {
  id: string;
  profileId: string;
  sortOrder: number;
  title: string;
  description: string;
  colorLeft: string;
  ColorRight: string;
  privateAccess: number;
  url?: string;
  favoriteFotoId?: string;
}
