import { Request, Response, NextFunction } from 'express'

export default function setupRequestServices(services: Record<string, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const servicesObject: any = {}

    Object.entries(services).forEach(([name, service]) => {
      servicesObject[name] = service(req)
    })

    req.services = servicesObject

    return next()
  }
}
