# Example App Router with next-auth Without i18n Routing

This example demonstrates how an application can use a locale defined in the `i18n.ts` file for `next-intl` in an App Router setup ([without i18n routing](https://next-intl-docs.vercel.app/docs/getting-started/app-router/without-i18n-routing)) with `next-auth` integration.

This application uses Server Actions in one place:

1. **Locale Management**: The locale is stored in a cookie and can be updated using the `setUserLocale` function in [`src/services/locale.ts`](./src/services/locale.ts).

User authentication is handled using `next-auth`.

## Run Your Own Instance

### Locally

To run this project locally, follow these steps:

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create a `.env.local` file:**

   In the root directory of the project, create a file named `.env.local` and add the following environment variables:

   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   ```

   - **Note:** Replace `your-secret-key` with your own secret key. You can generate it using the command:

     ```bash
     openssl rand -base64 32
     ```

   - If you are using a different port for your local server (e.g., `3002`), change `NEXTAUTH_URL` to the appropriate address:

     ```env
     NEXTAUTH_URL=http://localhost:3002
     ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open the application in your browser:**

   Navigate to [http://localhost:3000](http://localhost:3000) (or the port you specified) in your browser.

5. **Log in:**

   Use the following credentials to log in:

   - **Username:** `admin`
   - **Password:** `admin`

### Deploying to Vercel

By deploying the application to [Vercel](https://vercel.com), you can see the example in action. Note that during the process, you will be prompted to create a new GitHub repository, allowing you to make further changes.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/amannn/next-intl/tree/main/examples/example-app-router-without-i18n-routing)