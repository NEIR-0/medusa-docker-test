import { model } from "@medusajs/framework/utils"

const Post = model.define("post", {
  id: model.id().primaryKey(),
  title: model.text(),
  description: model.text().nullable(), 
  subtitle: model.text().nullable(), 
})

export default Post