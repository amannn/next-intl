export default async function PhotoPage({params}: PageProps<'/photo/[id]'>) {
  const {id} = await params;

  return (
    <div>
      <h2>Photo page: {id}</h2>
    </div>
  );
}
