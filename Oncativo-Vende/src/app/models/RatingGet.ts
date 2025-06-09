export interface RatingGet {
    id: number;
    rating: number;
    comment: string;
    rater_user: {
        id: number;
        name: string;
        surname: string;
        username: string;
        verified: boolean;
        rating: number;
        avatar_url: string | null;
    };
    rated_user_id: number;
    created_at: string; 
}