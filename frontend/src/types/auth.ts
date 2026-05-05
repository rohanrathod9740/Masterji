export type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
};

export type AuthSession = {
  token: string | null;
  user: SessionUser;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type SignupPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
};
