export interface BaseApiResponse<T> {
  isSuccess: boolean;
  data: T;
  message: string;
  totalRecords: number;
  errors?: ApiError[]
  accessToken: string;
  refreshToken: string
}

export interface ApiError {
  propertyName: string;
  errorMessage: string;
}