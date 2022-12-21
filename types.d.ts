interface BaseReq {
  key: string
}

interface BaseQuery {
  uid: string
}

interface PostsQuery {
  uid?: string
  username?: string
  limit?: number
}

interface Post {
  author: number
  contents: string
  date_created: Date
  likes: number
  comments: number
}

interface RatelimitQueryResults {
  uid: number
  last_query: string
  type: string
}