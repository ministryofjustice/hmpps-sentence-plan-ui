import { validateSync, ValidationError } from 'class-validator'
import { NextFunction, Request, Response } from 'express'
import RequestDataSources from '../@types/RequestDataSources'
import 'reflect-metadata'

interface FlatValidationError {
  constraintsNotMet: string[]
  messages: string[]
}

function flattenValidationErrors(errors: ValidationError[], path = ''): Record<string, FlatValidationError> {
  return errors.reduce(
    (acc, error) => {
      const propertyPath = path ? `${path}.${error.property}` : error.property

      if (error.constraints) {
        const { constraints } = error
        acc[propertyPath] = {
          constraintsNotMet: Object.keys(constraints),
          messages: Object.values(constraints),
        }
      }

      if (error.children && error.children.length > 0) {
        const childMap = flattenValidationErrors(error.children, propertyPath)
        Object.assign(acc, childMap)
      }
      return acc
    },
    {} as Record<string, FlatValidationError>,
  )
}

export function getValidationErrors(data: object) {
  const errors = validateSync(data)
  return flattenValidationErrors(errors)
}

export default function validateRequest() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.errors) {
      req.errors = {}
    }

    Object.values(RequestDataSources).forEach(source => {
      req.errors[source] = req[source]?.constructor?.name !== 'Object' ? getValidationErrors(req[source]) : {}
    })

    return next()
  }
}
