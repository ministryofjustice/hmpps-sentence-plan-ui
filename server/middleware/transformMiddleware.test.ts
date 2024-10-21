/* eslint-disable max-classes-per-file */
import { Request, Response, NextFunction } from 'express'
import 'reflect-metadata'
import { Type } from 'class-transformer'
import mockReq from '../testutils/preMadeMocks/mockReq'
import mockRes from '../testutils/preMadeMocks/mockRes'
import RequestDataSources from '../@types/RequestDataSources'
import transformRequest from './transformMiddleware'

class BodyClass {
  field: string
}

class ParamsClass {
  @Type(() => Number)
  id: number
}

class QueryClass {
  search: string
}

describe('transformMiddleware', () => {
  describe('transformRequest', () => {
    let req: Partial<Request>
    let res: Partial<Response>
    let next: NextFunction

    beforeEach(() => {
      req = mockReq({
        body: { field: 'value' },
        params: { id: '123' },
        query: { search: 'term' },
      })
      res = mockRes()
      next = jest.fn()
    })

    it('should transform req.body using the specified class', () => {
      const middleware = transformRequest({
        [RequestDataSources.BODY]: BodyClass,
      })

      middleware(req as Request, res as Response, next)

      expect(req.body).toBeInstanceOf(BodyClass)
      expect(req.body.field).toBe('value')
      expect(next).toHaveBeenCalled()
    })

    it('should transform req.params using the specified class', () => {
      const middleware = transformRequest({
        [RequestDataSources.PARAMS]: ParamsClass,
      })

      middleware(req as Request, res as Response, next)

      expect(req.params).toBeInstanceOf(ParamsClass)
      expect(req.params.id).toBe(123)
      expect(next).toHaveBeenCalled()
    })

    it('should transform req.query using the specified class', () => {
      const middleware = transformRequest({
        [RequestDataSources.QUERY]: QueryClass,
      })

      middleware(req as Request, res as Response, next)

      expect(req.query).toBeInstanceOf(QueryClass)
      expect(req.query.search).toBe('term')
      expect(next).toHaveBeenCalled()
    })

    it('should handle multiple transformations', () => {
      const middleware = transformRequest({
        [RequestDataSources.BODY]: BodyClass,
        [RequestDataSources.PARAMS]: ParamsClass,
        [RequestDataSources.QUERY]: QueryClass,
      })

      middleware(req as Request, res as Response, next)

      expect(req.body).toBeInstanceOf(BodyClass)
      expect(req.params).toBeInstanceOf(ParamsClass)
      expect(req.query).toBeInstanceOf(QueryClass)
      expect(next).toHaveBeenCalled()
    })

    it('should not transform if the class is not specified', () => {
      const middleware = transformRequest({})

      middleware(req as Request, res as Response, next)

      expect(req.body).not.toBeInstanceOf(BodyClass)
      expect(req.params).not.toBeInstanceOf(ParamsClass)
      expect(req.query).not.toBeInstanceOf(QueryClass)
      expect(next).toHaveBeenCalled()
    })
  })
})
