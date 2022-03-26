import parseHeader from '../parseHeader.js';
import validBlocks from '../validBlocks.js';

async function wordleValidationMiddleware({ message, next }) {
  const [header, , ...blocks] = message.text.split('\n')
  const { valid: validHeader, score } = parseHeader(header)
  if (validHeader === false) {
    return 
  }
  if (validBlocks(blocks, score) === false) {
    return 
  }
  console.log('received valid wordle submission')
  return await next()
}

export default wordleValidationMiddleware