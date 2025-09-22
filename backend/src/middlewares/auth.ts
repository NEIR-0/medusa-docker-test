// src/api/middlewares/auth.ts
import type { 
  MedusaRequest, 
  MedusaResponse, 
  MedusaNextFunction 
} from "@medusajs/framework/http"

export const requireAuth = () => {
  return async (
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ) => {
    try {
      // Check for Authorization header
      const authHeader = req.headers.authorization
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          message: "Authorization token required"
        })
      }

      // Extract token
      const token = authHeader.substring(7) // Remove 'Bearer '
      
      // Validate token (example - adjust based on your auth system)
      // You might want to verify JWT, check database, etc.
      if (!token || token === 'invalid') {
        return res.status(401).json({
          message: "Invalid or expired token"
        })
      }

      // Optionally attach user info to request
      // const user = await validateToken(token)
      // req.user = user

      next()
    } catch (error) {
      return res.status(401).json({
        message: "Authentication failed",
        error: error.message
      })
    }
  }
}

// Alternative: Admin-only middleware
export const requireAdmin = () => {
  return async (
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ) => {
    try {
      // Check if user is admin
      // This assumes you have user info in request
      const authHeader = req.headers.authorization
      
      if (!authHeader) {
        return res.status(401).json({
          message: "Admin access required"
        })
      }

      // Your admin validation logic here
      // const isAdmin = await checkAdminStatus(token)
      // if (!isAdmin) {
      //   return res.status(403).json({
      //     message: "Admin privileges required"
      //   })
      // }

      next()
    } catch (error) {
      return res.status(403).json({
        message: "Admin access denied",
        error: error.message
      })
    }
  }
}