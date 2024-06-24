export async function loginUser(credentials: {
  email: string;
  password: string;
}) {
  // In a real app, the credentials would be checked against a
  // database and potentially a session token set in a cookie
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        credentials.email === 'jane@doe.com' &&
          credentials.password === 'password'
      );
    }, 1000);
  });
}
