import {AuthOptions} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: {label: 'Username', type: 'text'},
        password: {label: 'Password', type: 'password'}
      },
      async authorize(credentials) {
        if (
          credentials?.username === 'admin' &&
          credentials.password === 'admin'
        ) {
          return {id: '1', name: 'admin'};
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login'
  }
};
