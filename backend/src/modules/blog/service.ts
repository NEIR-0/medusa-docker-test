import { MedusaService } from "@medusajs/framework/utils"
import Post from "./models/post"

class BlogModuleService extends MedusaService({
  Post,
}) {
  async createPost(data: { title: string }) {
    return await this.createPosts(data) // ✅
  }

  async listPost() {
    return await this.listPosts() // ✅
  }

  async getPost(id: string) {
    return await this.retrievePost(id) // ✅
  }

  async updatePost(id: string, data: { title?: string }) {    
    return await this.updatePosts({ // hover, karena dari hover kita tau cara masukin datanya
      id, 
      ...data 
    })
  }

  async deletePost(id: string) {
    return await this.deletePosts([id]) // ✅
  }
}

export default BlogModuleService