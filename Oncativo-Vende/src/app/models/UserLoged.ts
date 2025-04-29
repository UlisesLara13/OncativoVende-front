export class UserLoged{
    id: number;
    name: string;
    surname: string;
    roles: string[];
    avatar: string;
    constructor(){
        this.id = 0;
        this.roles = [];
        this.name = '';
        this.surname = '';
        this.avatar = '';
    }
}