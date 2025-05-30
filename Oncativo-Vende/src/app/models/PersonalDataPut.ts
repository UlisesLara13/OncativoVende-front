export class PersonalDataPut {
    name: string;
    surname?: string;
    email: string;
    location_id: number;

    constructor(name: string, email: string, location_id: number, surname?: string) {
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.location_id = location_id;
    }
}