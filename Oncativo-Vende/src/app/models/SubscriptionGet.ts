export class SubscriptionGet { 
  id: number;
  user: {
    id: number;
    name: string;
    surname: string;
    verified: boolean;
    avatar_url?: string;
    rating: number;
  };
  subscription_type: {
    id: number;
    description: string;
    price: number;
  };
  start_date: string; 
  end_date: string;   
  total_price: number;
  discount_applied: number;

    constructor() {
        this.id = 0;
        this.user = {
        id: 0,
        name: '',
        surname: '',
        verified: false,
        avatar_url: undefined,
        rating: 0
        };
        this.subscription_type = {
        id: 0,
        description: '',
        price: 0
        };
        this.start_date = '';
        this.end_date = '';
        this.total_price = 0;
        this.discount_applied = 0;
    }

}
