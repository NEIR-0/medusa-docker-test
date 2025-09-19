// src/workflows/post-workflows.ts
import { 
  createStep, 
  createWorkflow, 
  StepResponse, 
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { BLOG_MODULE } from "../modules/blog"
import BlogModuleService from "../modules/blog/service"

// Types
type CreatePostWorkflowInput = {
  title: string
}

type UpdatePostWorkflowInput = {
  id: string
  title?: string
}

type DeletePostWorkflowInput = {
  id: string
}

// CREATE WORKFLOW
const createPostStep = createStep(
  "create-post",
  async ({ title }: CreatePostWorkflowInput, { container }) => {
    const blogModuleService: BlogModuleService = container.resolve(BLOG_MODULE)
    const post = await blogModuleService.createPost({ title })
    return new StepResponse(post, post)
  },
  async (post, { container }) => {
    const blogModuleService: BlogModuleService = container.resolve(BLOG_MODULE)
    await blogModuleService.deletePost(post.id)
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
  async ({ id, ...updateData }: UpdatePostWorkflowInput, { container }) => {
    const blogModuleService: BlogModuleService = container.resolve(BLOG_MODULE)
    
    // Store original data for rollback
    const originalPost = await blogModuleService.getPost(id)
    const updatedPost = await blogModuleService.updatePost(id, updateData)

    return new StepResponse(updatedPost, { id, originalData: originalPost })
  },
  async ({ id, originalData }, { container }) => {
    const blogModuleService: BlogModuleService = container.resolve(BLOG_MODULE)
    await blogModuleService.updatePost(id, { title: originalData.title })
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
    const blogModuleService: BlogModuleService = container.resolve(BLOG_MODULE)
    await blogModuleService.createPost({ title: originalPost.title })
  }
)

export const deletePostWorkflow = createWorkflow(
  "delete-post",
  (postInput: DeletePostWorkflowInput) => {
    deletePostStep(postInput)
    return new WorkflowResponse({ deleted: true })
  }
)