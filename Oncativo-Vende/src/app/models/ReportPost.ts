export class ReportPost {
reported_by_user_id: number;
publication_id: number;
reason: string;

constructor(reportedByUserId: number, publicationId: number, reason: string) {
    this.reported_by_user_id = reportedByUserId;
    this.publication_id = publicationId;
    this.reason = reason;
    }
}