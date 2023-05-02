import {AuthOptions} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const auth: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: {type: 'text'},
        password: {type: 'password'}
      },
      authorize(credentials) {
        if (
          credentials?.username === 'admin' &&
          credentials.password === 'admin'
        ) {
          return {id: '1', name: 'admin'};
        }

        return null;
      }
    })
  ]
};

export default auth;
