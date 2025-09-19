import type { 
  MedusaRequest, 
  MedusaResponse,
} from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../../modules/blog"
import BlogModuleService from "../../../../modules/blog/service"
import { updatePostWorkflow, deletePostWorkflow } from "../../../../workflows/post-workflows"

export async function GET(
  req: MedusaRequest, 
  res: MedusaResponse
) {
  const { id } = req.params
  const blogModuleService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  
  try {
    const post = await blogModuleService.getPost(id) // ubah ke getPost
    res.json({ post })
  } catch (error) {
    res.status(404).json({ 
      message: "Post not found",
      error: error.message 
    })
  }
}

export async function PUT(
  req: MedusaRequest, 
  res: MedusaResponse
) {
  const { id } = req.params
  const { title } = req.body
  
  try {
    const { result: post } = await updatePostWorkflow(req.scope)
      .run({
        input: { id, title },
      })

    res.json({ post })
  } catch (error) {
    res.status(400).json({ 
      message: "Failed to update post",
      error: error.message 
    })
  }
}

export async function DELETE(
  req: MedusaRequest, 
  res: MedusaResponse
) {
  const { id } = req.params

  try {
    await deletePostWorkflow(req.scope)
      .run({
        input: { id },
      })

    res.json({ 
      message: "Post deleted successfully",
      deleted: true 
    })
  } catch (error) {
    res.status(400).json({ 
      message: "Failed to delete post",
      error: error.message 
    })
  }
}