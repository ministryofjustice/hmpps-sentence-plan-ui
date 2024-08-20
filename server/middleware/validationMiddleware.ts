import { ClassConstructor, plainToInstance } from 'class-transformer'
import { validateSync, ValidationError } from 'class-validator'
import { Request, Response, NextFunction } from 'express'

enum DataSources {
  BODY = 'body',
  PARAMS = 'params',
  QUERY = 'query',
}

function simplifyValidationErrors(errors: ValidationError[]): any {
  const result: any = {}
  errors.forEach(error => {
    result[error.property] = error.constraints
      ? Object.keys(error.constraints).reduce((acc, key) => ({ ...acc, [key]: true }), {})
      : {}
  })
  return result
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
