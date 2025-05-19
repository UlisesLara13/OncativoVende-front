export interface PublicationPost {
    user_id: number;
    title: string;
    description: string;
    price: number;
    location_id: number;
    categories: number[];
    tags: number[];
    images: string[];
    contacts: {
    contact_type_id: number;
    contact_value: string;
    }[];
}