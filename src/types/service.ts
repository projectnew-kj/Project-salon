export interface Haircut {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  durationMinutes: number;
  displayOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  _id: string;
  title: string;
  description: string;
  image: string;
  originalPrice: number;
  offerPrice: number;
  discountPercentage: number;
  services: Haircut[] | string[];
  validFrom: string;
  validTo: string;
  displayOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HaircutFormPayload {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  image?: string;
  isActive?: boolean;
}

export interface OfferFormPayload {
  title: string;
  description: string;
  originalPrice: number;
  offerPrice: number;
  services: string[];
  validFrom: string;
  validTo: string;
  image?: string;
  isActive?: boolean;
}
