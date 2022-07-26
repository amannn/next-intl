import fetchData from './fetch-data'

export default async function (
  type = 'topstories',
  { page = 1, max = 30 } = {}
) {
  const start = max * (page - 1)
  const end = start + max
  const ids = await fetchData(type)
  return ids.slice(start, end)
}
