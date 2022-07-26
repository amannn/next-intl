import { Suspense } from 'react'
import Story from '../components/story.client'
import Comment from '../components/comment'
import CommentForm from '../components/comment-form'
import useData from '../lib/use-data'
import getComments from '../lib/get-comments'
import Skeletons from './skeletons'

function Comments({ story }) {
  if (!story) return <div className="loading">No Comments</div>
  const { data: comments } = useData(`comments/${story.id}`, () => getComments(story.comments))
  return (
    <div className="comments">
      {(comments || []).map((comment) => (
        <Comment key={comment.id} {...comment} />
      ))}
    </div>
  )
}

export default function Item({ story }) {
  return (
    <div className="item">
      <style jsx>{`
        .item {
          padding: 10px 29px;
        }
        .form {
          padding: 15px 0;
        }
        .loading {
          font-size: 13px;
        }
        .comments {
          padding: 10px 0 20px;
        }
        @media (max-width: 750px) {
          .item {
            padding: 8px 0px;
          }
        }
      `}</style>
      <Story {...story} />

      <div className="form">
        <CommentForm />
      </div>

      <Suspense
        fallback={
          <div>
            {`Loading comments...`}
            <Skeletons count={3} />
          </div>
        }
      >
        <Comments story={story} />
      </Suspense>
    </div>
  )
}
