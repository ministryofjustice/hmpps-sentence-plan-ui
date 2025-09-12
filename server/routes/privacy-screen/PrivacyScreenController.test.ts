import { NextFunction, Request, Response } from 'express'
import mockReq from '../../testutils/preMadeMocks/mockReq'
import mockRes from '../../testutils/preMadeMocks/mockRes'
import locale from './locale.json'
import { AccessMode } from '../../@types/Handover'
import PrivacyScreenController from './PrivacyScreenController'
import runMiddlewareChain from '../../testutils/runMiddlewareChain'
import URLs from '../URLs'

const systemReturnUrl = 'https://oasys.return.url'

jest.mock('../../services/sessionService', () => {
  return jest.fn().mockImplementation(() => ({
    getSystemReturnUrl: jest.fn().mockReturnValue(systemReturnUrl),
    getAccessMode: jest.fn().mockReturnValue(AccessMode.READ_WRITE),
  }))
})

describe('PrivacyScreenController with READ_WRITE permissions', () => {
  let controller: PrivacyScreenController

  let req: Request
  let res: Response
  let next: NextFunction
  let viewData: any

  beforeEach(() => {
    jest.clearAllMocks()

    viewData = {
      locale: locale.en,
      data: {
        privacyScreen: true,
        systemReturnUrl,
        form: {},
      },
      errors: {},
    }

    req = mockReq()
    res = mockRes()
    next = jest.fn()

    controller = new PrivacyScreenController()
  })

  describe('get', () => {
    it('should render without validation errors', async () => {
      await runMiddlewareChain(controller.get, req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/privacy-screen', viewData)
    })
  })

  describe('post', () => {
    it('should redirect to plan overview if checkbox checked', async () => {
      req.body = { 'confirm-privacy-checkbox': 'true', action: 'confirm' }

      await runMiddlewareChain(controller.post, req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(URLs.PLAN_OVERVIEW)
    })

    it('should re-render privacy screen page if checkbox not checked', async () => {
      req.body = { 'confirm-privacy-checkbox': '', action: 'confirm' }

      await runMiddlewareChain(controller.post, req, res, next)
      expect(res.render).toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalledWith(URLs.PLAN_OVERVIEW)
    })
  })
})
