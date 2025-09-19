import type { 
  MedusaRequest, 
  MedusaResponse,
} from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../modules/blog"
import BlogModuleService from "../../../modules/blog/service"
import { createPostWorkflow } from "../../../workflows/post-workflows"

export async function GET(
  req: MedusaRequest, 
  res: MedusaResponse
) {
  const blogModuleService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  
  const posts = await blogModuleService.listPosts()

  res.json({
    posts,
  })
}

export async function POST(
  req: MedusaRequest, 
  res: MedusaResponse
) {
  const { title } = req.body
  
  const { result: post } = await createPostWorkflow(req.scope)
    .run({
      input: { title },
    })

  res.json({
    post,
  })
}