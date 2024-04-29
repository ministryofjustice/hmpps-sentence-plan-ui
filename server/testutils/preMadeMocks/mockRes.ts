import { Response } from 'express'

const mockRes = (res = {} as Response) => {
  res.render = jest.fn().mockReturnThis()
  res.redirect = jest.fn().mockReturnThis()
  return res
}

export default mockRes
