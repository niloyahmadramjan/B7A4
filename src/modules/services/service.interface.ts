export interface IService {
  categoryId: string;
  title: string;
  description: string;
  price: number;
  duration: number;
}

export interface IServiceUpdated {
  categoryId?: string;
  title?: string;
  description?: string;
  price?: number;
  duration?: number;
}

export interface IServiceQuery {
  searchItem?: string;
  title?: string;
  category?: string;
  location?: string;
  rating?: string;
  minPrice?: string;
  maxPrice?: string;

  page?: string;
  limit?: string;

  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
