export interface IFolder {
  id: string;
  profileId: string;
  sortOrder: number;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  privateAccess: number;
  url?: string;
  favoriteFotoId?: string;
}
