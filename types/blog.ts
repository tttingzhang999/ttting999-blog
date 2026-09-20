export interface BlogPost {
  path: string
  title: string
  description: string
  date: string
  tags: string[]
  category: string
  author: string
  image?: string

  body?: any
  id?: string
}

export interface BlogCategory {
  name: string
  slug: string
  count: number
}

export interface BlogTag {
  name: string
  slug: string
  count: number
}
