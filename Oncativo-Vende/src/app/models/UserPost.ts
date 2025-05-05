export class UserPost {
    name: string;
    surname: string;
    username: string;
    email: string;
    password: string;
    location_id: number;
    avatar_url?: string;
    roles: number[];

    constructor() {
        this.name = '';
        this.surname = '';
        this.username = '';
        this.password = '';
        this.email = '';
        this.avatar_url = '';
        this.location_id = 0;
        this.roles = [];
    }
}