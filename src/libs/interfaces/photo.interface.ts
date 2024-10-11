export interface IPhoto {
  id: string;
  sortOrder: number;
  profileId: string;
  folderId: string;
  camera: string;
  lens?: string;
  iso?: string;
  film?: string;
  location?: string;
  description?: string;
  likes?: number;
  url: string;
}
