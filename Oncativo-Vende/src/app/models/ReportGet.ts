import { PublicationGet } from "./PublicationGet";
import { UserGet } from "./UserGet";

export interface ReportGet {
id: number;
reporter: UserGet;
publication: PublicationGet;  
reason: string;
response: string | null;
status: string;
created_at: string;
}