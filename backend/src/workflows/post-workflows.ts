// src/workflows/post-workflows.ts
import { 
  createStep, 
  createWorkflow, 
  StepResponse, 
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { BLOG_MODULE } from "../modules/blog"
import BlogModuleService from "../modules/blog/service"
import PostUserLink from "../links/post-user"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"

// Types
export type CreatePostWorkflowInput = {
  title: string,
  description: string
  subtitle: string
  user_id: string
}

export type UpdatePostWorkflowInput = {
  id: string
  title?: string,
  description?: string
  subtitle?: string
}

type DeletePostWorkflowInput = {
  id: string,
}

// GET
const getPostsStep = createStep(
  "get-posts",
  async (_, { container }) => {
    const query = container.resolve("query")
    
    // 1. Get posts
    const { data: posts } = await query.graph({
      entity: "post",
      fields: ["*"],
      pagination: {
        take: 5,
        skip: 0,
      },
    })

    // 2. Get unique user IDs
    const userIds = [...new Set(posts.map((post: any) => post.user_id).filter(Boolean))]
    
    // 3. Batch query all users in single query
    let users: any[] = []
    if (userIds.length > 0) {
      const { data: usersData } = await query.graph({
        entity: "user",
        fields: ["id", "email", "first_name", "last_name", "created_at", "updated_at"],
        filters: { id: { $in: userIds } }
      })
      users = usersData
    }

    // 4. Create user lookup map for O(1) access
    const userMap = new Map(users.map(user => [user.id, user]))

    // 5. Combine posts with users
    const postsWithUsers = posts.map((post: any) => ({
      ...post,
      user: post.user_id ? userMap.get(post.user_id) || null : null
    }))

    return new StepResponse(postsWithUsers)
  }
)

export const getPostWorkflow = createWorkflow(
  "get-posts",
  () => {
    const posts = getPostsStep()
    return new WorkflowResponse({
      posts: posts,
    })
  }
)

// CREATE WORKFLOW
const createPostStep = createStep(
  "create-post",
  async (input: CreatePostWorkflowInput, { container }) => {
    const blogModuleService: BlogModuleService = container.resolve(BLOG_MODULE)
    const post = await blogModuleService.createPost(input)
    return new StepResponse(post, post)
  },
  async (post, { container }) => {
    if (post) {
      const blogModuleService: BlogModuleService = container.resolve(BLOG_MODULE)
      await blogModuleService.deletePost(post.id)
    }
  }
)

export const createPostWorkflow = createWorkflow(
  "create-post",
  (postInput: CreatePostWorkflowInput) => {
    const post = createPostStep(postInput)
    return new WorkflowResponse(post)
  }
)

// UPDATE WORKFLOW
const updatePostStep = createStep(
  "update-post",
  async (input : UpdatePostWorkflowInput, { container }) => {
    const blogModuleService: BlogModuleService = container.resolve(BLOG_MODULE)
    
    // Store original data for rollback
    const originalPost = await blogModuleService.getPost(input?.id)
    const updatedPost = await blogModuleService.updatePost(input?.id ,input)
    
    return new StepResponse(updatedPost, { id: input?.id, originalData: originalPost })
  },
  async (compensationData, { container }) => {
    if (compensationData) {
      const blogModuleService: BlogModuleService = container.resolve(BLOG_MODULE)
      await blogModuleService.updatePost(compensationData.id, { title: compensationData.originalData.title })
    }
  }
)

export const updatePostWorkflow = createWorkflow(
  "update-post",
  (postInput: UpdatePostWorkflowInput) => {
    const post = updatePostStep(postInput)
    return new WorkflowResponse(post)
  }
)

// DELETE WORKFLOW
const deletePostStep = createStep(
  "delete-post",
  async ({ id }: DeletePostWorkflowInput, { container }) => {
    const blogModuleService: BlogModuleService = container.resolve(BLOG_MODULE)
    
    // Store original data for rollback
    const originalPost = await blogModuleService.getPost(id)
    await blogModuleService.deletePost(id)
    
    return new StepResponse({ id }, originalPost)
  },
  async (originalPost, { container }) => {
    if (originalPost) {
      const blogModuleService: BlogModuleService = container.resolve(BLOG_MODULE)
      await blogModuleService.createPost({ 
        title: originalPost.title,
        description: originalPost.description || '',
        subtitle: originalPost.subtitle || '',
        user_id: originalPost.user_id || ''
      })
    }
  }
)

export const deletePostWorkflow = createWorkflow(
  "delete-post",
  (postInput: DeletePostWorkflowInput) => {
    deletePostStep(postInput)
    return new WorkflowResponse({ deleted: true })
  }
)