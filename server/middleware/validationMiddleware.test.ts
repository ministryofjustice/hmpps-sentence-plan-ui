/* eslint-disable max-classes-per-file */
import { IsInt, IsNotEmpty, Min, MinLength, ValidateNested } from 'class-validator'
import { Expose, plainToInstance, Transform } from 'class-transformer'
import validateRequest, { getValidationErrors } from './validationMiddleware'
import mockReq from '../testutils/preMadeMocks/mockReq'
import mockRes from '../testutils/preMadeMocks/mockRes'

describe('validation', () => {
  describe('getValidationErrors', () => {
    describe('nested validation', () => {
      class TestNestedModel {
        @IsNotEmpty()
        foo: string

        @IsNotEmpty()
        bar: string
      }

      class TestModel {
        @IsNotEmpty()
        title: string

        @Expose()
        @ValidateNested()
        @Transform(({ obj }) => {
          return Object.keys(obj)
            .filter(key => key.startsWith('nested-foo-'))
            .map(key => key.slice(-1))
            .map(row =>
              plainToInstance(TestNestedModel, {
                foo: obj[`nested-foo-${row}`],
                bar: obj[`nested-bar-${row}`],
              }),
            )
        })
        nested: TestNestedModel[]
      }

      it('should return no errors when nested validation passes', () => {
        const data = {
          title: 'a test title',
          'nested-foo-1': 'Foo 1',
          'nested-bar-1': 'Bar 1',
          'nested-foo-2': 'Foo 2',
          'nested-bar-2': 'bar 2',
        }

        const dataInstance = plainToInstance(TestModel, data)
        const errors = getValidationErrors(dataInstance)
        expect(errors).toEqual({})
      })

      it('should return errors when nested validation fails', () => {
        const data = {
          title: 'a test title',
          'nested-foo-1': 'Foo 1',
          'nested-foo-2': 'Foo 2',
          'nested-bar-2': 'bar 2',
        }

        const dataInstance = plainToInstance(TestModel, data)
        const errors = getValidationErrors(dataInstance)
        expect(errors).toEqual({
          'nested.0.bar': {
            isNotEmpty: true,
          },
        })
      })
    })

    describe('field validation', () => {
      class TestModel {
        @IsNotEmpty()
        title: string

        @IsNotEmpty()
        anotherString: string

        @IsInt()
        selectedNumber: string
      }

      it('should return no errors when field validation passes', () => {
        const data = {
          title: 'a test title',
          anotherString: 'another test string',
          selectedNumber: 4,
        }

        const dataInstance = plainToInstance(TestModel, data)
        const errors = getValidationErrors(dataInstance)
        expect(errors).toEqual({})
      })

      it('should return no errors when field validation passes', () => {
        const data = {
          title: 'a test title',
          selectedNumber: 'should be a number',
        }

        const dataInstance = plainToInstance(TestModel, data)
        const errors = getValidationErrors(dataInstance)
        expect(errors).toEqual({
          anotherString: {
            isNotEmpty: true,
          },
          selectedNumber: {
            isInt: true,
          },
        })
      })
    })
  })

  describe('validateRequest', () => {
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
        body: plainToInstance(BodyDTO, { name: '' }),
        params: plainToInstance(ParamsDTO, { id: 'abc' }),
        query: plainToInstance(QueryDTO, { search: 'tooShort' }),
      })
      const res = mockRes()
      const next = jest.fn()

      const middleware = validateRequest()

      middleware(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(req.errors).toEqual({
        body: { name: { isNotEmpty: true } },
        params: { id: { isInt: true, min: true } },
        query: { search: { minLength: true } },
      })
    })

    it('should ensure req.body is a class instance and not a plain object', () => {
      const req = mockReq({
        body: { name: '' },
        params: plainToInstance(ParamsDTO, { id: 'abc' }),
        query: plainToInstance(QueryDTO, { search: 'justLongEnough' }),
      })
      const res = mockRes()
      const next = jest.fn()

      const middleware = validateRequest()

      middleware(req, res, next)

      expect(req.errors).toEqual({
        body: {},
        params: { id: { isInt: true, min: true } },
        query: {},
      })
      expect(next).toHaveBeenCalled()
    })

    it('should pass validation with no errors and call next', () => {
      const req = mockReq({
        body: plainToInstance(BodyDTO, { name: 'Mr. Egg' }),
        params: plainToInstance(ParamsDTO, { id: 3 }),
        query: plainToInstance(QueryDTO, { search: 'justLongEnough' }),
      })
      const res = mockRes()
      const next = jest.fn()

      const middleware = validateRequest()

      middleware(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(req.errors).toEqual({
        body: {},
        params: {},
        query: {},
      })
    })
  })
})
