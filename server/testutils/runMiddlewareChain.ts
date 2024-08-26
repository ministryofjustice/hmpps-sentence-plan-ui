import { NextFunction, Request, Response } from 'express'

export default async function runMiddlewareChain(
  middlewares: ((req: Request, res: Response, next: NextFunction) => void)[],
  req: Request,
  res?: Response,
  next?: NextFunction,
) {
  let index = 0

  async function nextMiddleware(err?: any): Promise<void> {
    if (err || res.headersSent || index >= middlewares.length) {
      return next(err)
    }

    // eslint-disable-next-line no-plusplus
    const middleware = middlewares[index++]

    try {
      return await middleware(req, res, nextMiddleware)
    } catch (error) {
      return next(error)
    }
  }

  await nextMiddleware()
}
