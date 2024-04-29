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

function validatePart<T>(req: Request, dtoClass: ClassConstructor<T>, source: DataSources) {
  const dtoInstance = plainToInstance(dtoClass, req[source])
  const errors = validateSync(dtoInstance as object)
  req[source] = dtoInstance
  req.errors[source] = simplifyValidationErrors(errors)
}

export default function validate(data: { [K in DataSources]?: ClassConstructor<any> }) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.errors) {
      req.errors = {}
    }

    if (data.body) {
      validatePart(req, data.body, DataSources.BODY)
    }
    if (data.params) {
      validatePart(req, data.params, DataSources.PARAMS)
    }
    if (data.query) {
      validatePart(req, data.query, DataSources.QUERY)
    }

    return next()
  }
}
