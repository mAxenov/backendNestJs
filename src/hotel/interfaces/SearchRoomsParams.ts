export interface SearchRoomsParams {
  limit: number;
  offset: number;
  dateStart: Date;
  dateEnd: Date;
  hotel: string;
  isEnabled?: boolean;
}

export interface SearchRoomsParamsAdmin {
  limit: number;
  offset: number;
  hotel: string;
  isEnabled?: boolean;
}
