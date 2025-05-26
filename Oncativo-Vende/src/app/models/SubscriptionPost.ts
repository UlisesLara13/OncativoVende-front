export class SubscriptionPost {
  user_id: number;
  subscription_type_id: number;
  start_date: string; 
  end_date: string;   
  total_price: number;
  discount_applied: number;
    constructor(
        user_id: number,
        subscription_type_id: number,
        start_date: string, 
        end_date: string,   
        total_price: number,
        discount_applied: number
    ) {
        this.user_id = user_id;
        this.subscription_type_id = subscription_type_id;
        this.start_date = start_date;
        this.end_date = end_date;
        this.total_price = total_price;
        this.discount_applied = discount_applied;
    }
}