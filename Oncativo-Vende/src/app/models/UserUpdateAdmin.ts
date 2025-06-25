export class UserUpdateAdmin {
    name: string;
    surname: string;
    email: string;
    location_id: number;
    roles: number[];
    constructor(
        name: string = '',
        surname: string = '',
        email: string = '',
        location_id: number = 0,
        roles: number[] = []
    ) {
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.location_id = location_id;
        this.roles = roles;
    }
}