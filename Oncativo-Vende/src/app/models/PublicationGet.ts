import { ContactGet } from "./ContactGet";

export interface PublicationGet {
    id: number;
    user: {
    id: number;
    name: string;
    surname: string;
    verified: boolean;
    avatar_url: string | null;
    rating: number;
        };
    title: string;
    description: string;
    price: number;
    active: boolean;
    location: string;
    created_at: string; 
    categories: string[];
    tags: string[];
    contacts: ContactGet[];
    images: string[];
    }