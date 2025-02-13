export default class IntegrationUtils {
  generateStringOfLength(length: number): string {
    let result = ''
    const characters = 'abcdefghijklmnopqrstuvwxyz'
    const charactersLength = characters.length

    for (let i = 0; i < length; i += 1) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
  }
}
