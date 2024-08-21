import { ClassConstructor, plainToInstance } from 'class-transformer'
import { validateSync, ValidationError } from 'class-validator'
import { NextFunction, Request, Response } from 'express'
import 'reflect-metadata'

enum DataSources {
  BODY = 'body',
  PARAMS = 'params',
  QUERY = 'query',
}

function simplifyValidationErrors(errorsList: ValidationError[]): Record<string, any> {
  function buildPrettyError(errorsInner: ValidationError[], path: string = ''): Record<string, any> {
    return errorsInner.reduce((accumulator, error) => {
      const currentPath = path ? `${path}.${error.property}` : error.property

      const updatedAccumulator = {
        ...accumulator,
        ...(error.constraints && {
          [currentPath]: Object.keys(error.constraints).reduce(
            (constraintAccumulator, key) => ({ ...constraintAccumulator, [key]: true }),
            {} as Record<string, boolean>,
          ),
        }),
      }

      if (error.children && error.children.length > 0) {
        const childErrors = buildPrettyError(error.children, currentPath)
        return { ...updatedAccumulator, ...childErrors }
      }

      return updatedAccumulator
    }, {})
  }

  return buildPrettyError(errorsList)
}

export function getValidationErrors<T>(objectToValidate: object, dtoClass: ClassConstructor<T>) {
  const dtoInstance = plainToInstance(dtoClass, objectToValidate)
  const errors = validateSync(dtoInstance as object)
  return simplifyValidationErrors(errors)
}

export default function validateRequest(data: { [K in DataSources]?: ClassConstructor<any> }) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.errors) {
      req.errors = {}
    }

    if (data.body) {
      req[DataSources.BODY] = plainToInstance(data.body, req[DataSources.BODY])
      req.errors[DataSources.BODY] = getValidationErrors(req.body, data.body)
    }

    if (data.params) {
      req[DataSources.PARAMS] = plainToInstance(data.params, req[DataSources.PARAMS])
      req.errors[DataSources.PARAMS] = getValidationErrors(req.params, data.params)
    }

    if (data.query) {
      req[DataSources.QUERY] = plainToInstance(data.query, req[DataSources.QUERY])
      req.errors[DataSources.QUERY] = getValidationErrors(req.query, data.query)
    }

    return next()
  }
}
