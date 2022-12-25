interface BaseReq {
  key: string
}

interface BaseQuery {
  uid: string
}

interface PostsQuery {
  uid?: number
  username?: string
  limit?: number
}

interface UserQuery {
  uid?: number
  username?: string
}

interface PostCreationBody {
  contents: string
}

interface Post {
  author: number
  contents: string
  date_created: Date
  likes: number
  comments: number
}

interface User {
  uid: number
  username: string
  icon: string
  bio: string
  followers: number
  following: number
}

interface RatelimitQueryResults {
  uid: number
  last_query: string
  type: string
}

interface FollowBody {
  uid?: number
  username?: string
}

interface FollowersQuery {
  uid?: number
  username?: string
}

interface LoginBody {
  email: string
  password: string
}