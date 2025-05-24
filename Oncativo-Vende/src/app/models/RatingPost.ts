export class RatingPost {
    rater_user_id: number;
    rated_user_id: number;
    rating: number;         
    comment: string;

    constructor() {
        this.rater_user_id = 0;
        this.rated_user_id = 0;
        this.rating = 0;
        this.comment = "";
    }
}

