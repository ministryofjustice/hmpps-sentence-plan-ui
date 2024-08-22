import { ClassConstructor, plainToInstance } from 'class-transformer'
import { NextFunction, Request, Response } from 'express'
import 'reflect-metadata'
import RequestDataSources from '../@types/enums/RequestDataSources'

export default function transformRequest(data: { [key in RequestDataSources]?: ClassConstructor<any> }) {
  return (req: Request, res: Response, next: NextFunction) => {
    Object.values(RequestDataSources).forEach(source => {
      if (data[source]) {
        req[source] = plainToInstance(data[source] as ClassConstructor<any>, req[source])
      }
    })

    return next()
  }
}
