import { MedusaService } from "@medusajs/framework/utils"
import Post from "./models/post"

class BlogModuleService extends MedusaService({ 
  Post,
}) {
  async createPost(data: { title: string; description: string; subtitle: string; user_id: string }) {
    return await this.createPosts(data) // ✅
  }

  async listPost() {
    return await this.listPosts() // ✅
  }

  async getPost(id: string) {
    return await this.retrievePost(id) // ✅
  }

  async updatePost(id: string, data: { title?: string; description?: string; subtitle?: string }) {
    return await this.updatePosts({ 
      id, 
      ...data 
    })
  }

  async deletePost(id: string) {
    return await this.deletePosts([id]) // ✅
  }
}

export default BlogModuleService