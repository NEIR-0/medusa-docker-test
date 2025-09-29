// src/links/post-user.ts
import BlogModule from "../modules/blog"
import UserModule from "@medusajs/medusa/user"
import { defineLink } from "@medusajs/framework/utils"

export default defineLink(
  UserModule.linkable.user,
  BlogModule.linkable.post
)