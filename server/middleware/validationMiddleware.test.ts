/* eslint-disable max-classes-per-file */
import { IsInt, IsNotEmpty, Min, MinLength } from 'class-validator'
import validate from './validationMiddleware'
import mockReq from '../testutils/preMadeMocks/mockReq'
import mockRes from '../testutils/preMadeMocks/mockRes'

describe('Validation Middleware', () => {
  class BodyDTO {
    @IsNotEmpty()
    name: string
  }

  class ParamsDTO {
    @IsInt()
    @Min(3)
    id: number
  }

  class QueryDTO {
    @MinLength(9)
    search: string
  }

  it('should attach errors to req and call next', () => {
    const req = mockReq({
      body: { name: '' },
      params: { id: 'abc' },
      query: { search: 'tooShort' },
    })
    const res = mockRes()
    const next = jest.fn()

    // Assuming validate function setup
    const middleware = validate({
      body: BodyDTO,
      params: ParamsDTO,
      query: QueryDTO,
    })

    middleware(req, res, next)

    // Expectations about the next call and req modifications
    expect(next).toHaveBeenCalled()
    expect(req.errors).toEqual({
      body: { name: { isNotEmpty: true } },
      params: { id: { isInt: true, min: true } },
      query: { search: { minLength: true } },
    })
  })

  it('should pass validation with no errors and call next', () => {
    const req = mockReq({
      body: { name: 'Mr. Egg' },
      params: { id: 3 },
      query: { search: 'justLongEnough' },
    })
    const res = mockRes()
    const next = jest.fn()

    const middleware = validate({
      body: BodyDTO,
      params: ParamsDTO,
      query: QueryDTO,
    })

    middleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(req.errors).toEqual({
      body: {},
      params: {},
      query: {},
    })
  })
})
