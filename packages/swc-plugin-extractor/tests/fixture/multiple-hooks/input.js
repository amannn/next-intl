import {useExtracted} from 'next-intl';
import {getExtracted} from 'next-intl/server';

export async function generateMetadata() {
  const t = await getExtracted();
  return {
    title: t("Page title")
  };
}

export default function Page() {
  const t = useExtracted();
  return <div>{t("Hello!")}</div>;
}

export async function getServerData() {
  const t = await getExtracted();
  return t("Server data message");
}

export function ClientComponent() {
  const t = useExtracted();
  return <span>{t("Client message")}</span>;
}
