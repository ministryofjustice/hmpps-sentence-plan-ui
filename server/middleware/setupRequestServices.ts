import { Request, Response, NextFunction } from 'express'
import { RequestServices } from '../services'

export default function setupRequestServices(services: Record<string, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    req.services = {} as RequestServices

    Object.entries(services).forEach(([name, service]) => {
      req.services[name as keyof RequestServices] = service(req)
    })

    return next()
  }
}
