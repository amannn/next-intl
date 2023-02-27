import NextLink from 'next/link';

export default function Link(props) {
  return (
    <NextLink
      className="text-sky-600 underline underline-offset-2 transition-colors hover:text-sky-700"
      {...props}
    />
  );
}
