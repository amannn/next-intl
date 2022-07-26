export default function Skeletons({ count = 30 }) {
  // Generating {count = 30} skeletons to match the size of the list.
  return (
    <div>
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <Skeleton key={index} />
        ))
      }
    </div>
  )
}

function Skeleton() {
  return <div className='item-skeleton' />
}
