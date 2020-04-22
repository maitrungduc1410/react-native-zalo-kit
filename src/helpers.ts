export function checkProps(source: any, props: Array<{ key: string, type: string }>) {
  for (const prop of props) {
    if (!source.hasOwnProperty(prop.key)) {
      throw new Error(`Property "${prop.key}" is required`)
    } else if (source[prop.key] === null) {
      throw new Error(`Property "${prop.key}" must not be null`)
    } else if (prop.type === 'array') {
      if (!Array.isArray(source[prop.key])) {
        throw new Error(`Property "${prop.key}" must be an array`)
      }
    } else if (typeof(source[prop.key]) !== prop.type) {
      throw new Error(`Property "${prop.key}" must be ${prop.type}`)
    }
  }
}
