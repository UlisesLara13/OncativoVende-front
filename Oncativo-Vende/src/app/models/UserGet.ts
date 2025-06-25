export class UserGet {
    id: number;
    name: string;
    surname: string;
    username: string;
    email: string;
    password: string;
    active: boolean;
    verified: boolean;
    location: string;
    avatar_url?: string;
    roles: string[];
    rating: number;
    subscription: string;
    created_at: string;
    constructor() {
        this.id = 0;
        this.name = '';
        this.surname = '';
        this.username = '';
        this.password = '';
        this.email = '';
        this.avatar_url = '';
        this.location = '';
        this.roles = [];
        this.active = false;
        this.verified = false;
        this.rating = 0;
        this.subscription = '';
        this.created_at = '';
    }
}