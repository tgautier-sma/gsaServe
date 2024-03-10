export const users: any[] = [];
export class User {
    id: string;
    name: string;
    email: string;
    password: string;
    secret: string;
    constructor(id: any, name: any, email: any, password: any, secret: any) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.secret = secret;
    }
};




