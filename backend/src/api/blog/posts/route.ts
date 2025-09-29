import type { 
  MedusaRequest, 
  MedusaResponse,
} from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../modules/blog"
import BlogModuleService from "../../../modules/blog/service"
import { createPostWorkflow, CreatePostWorkflowInput, getPostWorkflow } from "../../../workflows/post-workflows"

type UserInfo = {
  id: string
  type: string
  authIdentityId: string
}

export async function GET(
  req: MedusaRequest, 
  res: MedusaResponse
) {
  const workflowRunner = req.scope.resolve("workflows")
  const { result } = await workflowRunner.run(getPostWorkflow as any, {})

  res.json(result)
}

export async function POST(
  req: MedusaRequest, 
  res: MedusaResponse
) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: "Authorization required. Please provide Bearer token."
      })
    }

    const token = authHeader.substring(7)
    let userInfo: UserInfo | null = null
    try {
      const base64Payload = token.split('.')[1]
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString())
      const currentTime = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < currentTime) {
        return res.status(401).json({
          message: "Token expired. Please login again."
        })
      }

      userInfo = {
        id: payload.actor_id,
        type: payload.actor_type,
        authIdentityId: payload.auth_identity_id,
      }

      console.log("=== User authenticated ===")
      console.log(userInfo)
    } catch (e) {
      return res.status(401).json({
        message: "Invalid token format."
      })
    }

    const body = req.body as any
    const input: CreatePostWorkflowInput = {
      title: body.title || '',
      description: body.description || '',
      subtitle: body.subtitle || '',
      user_id: userInfo?.id || '',
    }

    // validate input
    // if (!title) {
    //   return res.status(400).json({
    //     message: "Title is required"
    //   })
    // }
    
    const { result: post } = await createPostWorkflow(req.scope).run({
      input
    })

    res.json({
      post,
      author: userInfo
    })
  } catch (error) {
    res.status(400).json({
      message: "Failed to create post",
      error: error.message
    })
  }
}