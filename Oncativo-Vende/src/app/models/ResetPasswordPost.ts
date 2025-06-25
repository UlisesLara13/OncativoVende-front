export class ResetPasswordPost{
    emailOrUsername: string;
    code: string;
    newPassword: string;
    constructor(emailOrUsername: string, code: string, newPassword: string) {
        this.emailOrUsername = emailOrUsername;
        this.code = code;
        this.newPassword = newPassword;
    }
}