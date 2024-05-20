type TImages = File | string;
export interface UpdateHotelParams {
  title: string;
  description: string;
  images: TImages[];
}
