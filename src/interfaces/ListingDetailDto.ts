export interface ListingDetailDto {
  id: string;
  listingId: string;
  articleId: string;
  name: string;
  description?: string;
  status?: string;
  date?: Date;
  createdAt: Date;
  updatedAt: Date;
}
