import { NextFunction, Request, Response } from 'express'
import ReferentialDataService from '../../services/sentence-plan/referentialDataService'
import locale from './locale.json'
import InfoService from '../../services/sentence-plan/infoService'
import NoteService from '../../services/sentence-plan/noteService'

export default class CreateGoalController {
  constructor(
    private readonly referentialDataService: ReferentialDataService,
    private readonly infoService: InfoService,
    private readonly noteService: NoteService,
  ) {}

  get = async (req: Request, res: Response, next: NextFunction) => {
    const { areaOfNeed } = req.params
    const crn = 'ABC123XYZ' // TODO: This is likely to be a session value, get from there

    try {
      const popData = await this.infoService.getPopData(crn)
      const referenceData = await this.getReferenceDataForAreaOfNeed(areaOfNeed)
      const noteData = await this.noteService.getNoteDataByAreaOfNeed(areaOfNeed, crn)
      const dateOptionsDate = getAchieveDateOptions(new Date())

      res.render('pages/create-goal', {
        locale: locale.en,
        data: {
          popData,
          referenceData,
          noteData,
          dateOptionsDate,
        },
      })
    } catch (e) {
      next(e)
    }
  }

  private async getReferenceDataForAreaOfNeed(areaOfNeed: string) {
    const referenceData = await this.referentialDataService.getAllQuestionData()
    return referenceData.AreasOfNeed.find(area => toKebabCase(area.Name) === areaOfNeed)
  }
}

function toKebabCase(string: string) {
  return string.replace(/ /g, '-').toLowerCase()
}

function getAchieveDateOptions(date: Date, dateOptionsInMonths = [3, 6, 12]) {
  return dateOptionsInMonths.map(option => {
    const achieveDate = new Date(date)
    achieveDate.setMonth(date.getMonth() + option)
    return achieveDate
  })
}
