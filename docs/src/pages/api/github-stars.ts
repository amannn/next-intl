import type {NextApiRequest, NextApiResponse} from 'next';

type ResponseBody = {
  stars: number | null;
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<ResponseBody>
) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    response.status(405).json({stars: null});
    return;
  }

  response.setHeader(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=86400'
  );

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'next-intl-docs'
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const githubResponse = await fetch(
      'https://api.github.com/repos/amannn/next-intl',
      {headers}
    );

    if (!githubResponse.ok) {
      response.status(200).json({stars: null});
      return;
    }

    const json: unknown = await githubResponse.json();
    const stars =
      typeof json === 'object' &&
      json !== null &&
      'stargazers_count' in json &&
      typeof (json as {stargazers_count: unknown}).stargazers_count === 'number'
        ? (json as {stargazers_count: number}).stargazers_count
        : null;

    response.status(200).json({stars});
  } catch {
    response.status(200).json({stars: null});
  }
}
