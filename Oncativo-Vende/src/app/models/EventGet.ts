export interface EventGet {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  user: {
    id: number;
    name: string;
    surname: string;
    username: string;
    verified: boolean;
    avatar_url?: string;
    rating: number; 
  };
  start_date?: string; 
  end_date?: string;
}