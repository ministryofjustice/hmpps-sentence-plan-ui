import { validateSync, ValidationError } from 'class-validator'
import { NextFunction, Request, Response } from 'express'
import RequestDataSources from '../@types/enums/RequestDataSources'

export function getValidationErrors(data: object) {
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

  const errors = validateSync(data)
  return buildPrettyError(errors)
}

export default function validateRequest() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.errors) {
      req.errors = {}
    }

    Object.values(RequestDataSources).forEach(source => {
      if (req[source] && req[source].constructor && req[source].constructor.name !== 'Object') {
        req.errors[source] = getValidationErrors(req[source])
      } else {
        req.errors[source] = {}
      }
    })

    return next()
  }
}
