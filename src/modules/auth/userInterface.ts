
export interface RegisterUserPayload {
    name: string;
    email: string;
    phone: string;
    password: string;
    avatar: string;

}

export interface UserLoginInfo {
  email: string;
  password: string;
}
