import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.string(),
        updatedAt: z.string().date().optional(),
        language: z.string().regex(/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/).default('zh-TW'),
        tags: z.array(z.string()),
        category: z.string(),
        author: z.string().default('Ting Zhang'),
        image: z.string().optional()
      })
    })
    // Projects now managed via data/projects.ts instead of Nuxt Content
    // projects: defineCollection({
    //   type: 'page',
    //   source: 'projects/*.md',
    //   schema: z.object({
    //     title: z.string(),
    //     description: z.string(),
    //     date: z.string(),
    //     tags: z.array(z.string()),
    //     github: z.string().optional(),
    //     demo: z.string().optional(),
    //     image: z.string().optional(),
    //     draft: z.boolean().default(false)
    //   })
    // })
  }
})
