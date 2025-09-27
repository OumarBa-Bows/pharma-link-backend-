export interface ArticleData {
  id: number;
  title: string;
  description?: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  // pour les autres champs dynamiques
}
