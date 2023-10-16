import {use} from 'react';

export default function useHook<Value>(
  hookName: string,
  promise: Promise<Value>
) {
  try {
    return use(promise);
  } catch (error: any) {
    if (
      error instanceof TypeError &&
      error.message.includes("Cannot read properties of null (reading 'use')")
    ) {
      throw new Error(
        `\`${hookName}\` is not callable within an async component. To resolve this, you can split your component into two, leaving the async code in the first one and moving the usage of \`${hookName}\` to the second one.

Example:

async function Profile() {
  const user = await getUser();
  return <ProfileContent user={user} />;
}

function ProfileContent({user}) {
  // Call \`${hookName}\` here and use the \`user\` prop
  return ...;
}`,
        {cause: error}
      );
    } else {
      throw error;
    }
  }
}
