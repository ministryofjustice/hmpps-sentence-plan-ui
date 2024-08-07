import LocaleService from './localeService'


describe('LocaleService', () => {
  let localeService: LocaleService

  beforeEach(async () => {
    localeService = new LocaleService()
    const pattern = 'server/data/locales/test/*.locale.json'
    await localeService.loadLocales(pattern)
  })

  describe('getLocales',() => {

    it('get a locale', () => {
      const data = localeService.getLocale('test')
      expect(data).toEqual({
        "testCommonString1": "This is the first common test string",
        "testCommonString2": "This is the second common test string with a {COMMON_REPLACEABLE_VARIABLE}",
        "testLocaleString1": "This is the first test string",
        "testLocaleString2": "This is the second test string, with a {REPLACEABLE_VARIABLE}",
        "testSubLocale1": {
          "testSubLocaleString1": "This is the first test string of sublocale testSubLocale1",
          "testSubLocaleString2": "This is the second test string of sublocale testSubLocale1, with a {SECOND_REPLACEABLE_VARIABLE}"
        }
      })
    })

    it('get a locale and perform interpolation', () => {
      const replacements = [
        ['{REPLACEABLE_VARIABLE}', 'dog'],
        ['{SECOND_REPLACEABLE_VARIABLE}', 'cat'],
        ['{COMMON_REPLACEABLE_VARIABLE}', 'parrot']
      ]

      const data = localeService.getLocale('test', replacements)
      expect(data).toEqual({
        "testCommonString1": "This is the first common test string",
        "testCommonString2": "This is the second common test string with a parrot",
        "testLocaleString1": "This is the first test string",
        "testLocaleString2": "This is the second test string, with a dog",
        "testSubLocale1": {
          "testSubLocaleString1": "This is the first test string of sublocale testSubLocale1",
          "testSubLocaleString2": "This is the second test string of sublocale testSubLocale1, with a cat"
        }
      })
    })

    it('get a locale but in Welsh', () => {
      const data = localeService.getLocale('test', [], "cy")
      expect(data).toEqual({
        "testCommonString1": "In Welsh, this is the first common test string",
        "testCommonString2": "In Welsh, this is the second common test string with a {COMMON_REPLACEABLE_VARIABLE}",
        "testLocaleString1": "In Welsh, this is the first test string",
        "testLocaleString2": "In Welsh, his is the second test string, with a {REPLACEABLE_VARIABLE}",
        "testSubLocale1": {
          "testSubLocaleString1": "In Welsh, this is the first test string of sublocale testSubLocale1",
          "testSubLocaleString2": "In Welsh, this is the second test string of sublocale testSubLocale1, with a {SECOND_REPLACEABLE_VARIABLE}"
        }
      })
    })

    it('get a locale and do interpolation but in Welsh', () => {
      const replacements = [
        ['{REPLACEABLE_VARIABLE}', 'welsh dog named `ci`'],
        ['{SECOND_REPLACEABLE_VARIABLE}', 'welsh cat named `cath`'],
        ['{COMMON_REPLACEABLE_VARIABLE}', 'welsh parrot named `parot`']
      ]

      const data = localeService.getLocale('test', replacements, "cy")
      expect(data).toEqual({
        "testCommonString1": "In Welsh, this is the first common test string",
        "testCommonString2": "In Welsh, this is the second common test string with a welsh parrot named `parot`",
        "testLocaleString1": "In Welsh, this is the first test string",
        "testLocaleString2": "In Welsh, his is the second test string, with a welsh dog named `ci`",
        "testSubLocale1": {
          "testSubLocaleString1": "In Welsh, this is the first test string of sublocale testSubLocale1",
          "testSubLocaleString2": "In Welsh, this is the second test string of sublocale testSubLocale1, with a welsh cat named `cath`"
        }
      })
    })
  })
})