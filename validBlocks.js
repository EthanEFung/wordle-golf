
const last = ':large_green_square::large_green_square::large_green_square::large_green_square::large_green_square:'

function validTry(attempt) {
  if (typeof attempt !== "string") {
    return false
  }
  if (!attempt.length) {
    return false
  }
  if (attempt[0] !== ":" || attempt[attempt.length-1] !== ':') {
    return false
  }

  const parsed = attempt.slice(1, attempt.length-1)
  const blocks = parsed.split("::")
  if (blocks.length !== 5) {
    return false
  }
  return blocks.every(block => [
    'large_green_square',
    'black_large_square',
    'large_yellow_square',
    'white_large_square'
  ].some((valid) => valid === block))
}

function validBlocks(attempts, tries) {
  if (
    !attempts ||
    typeof attempts !== 'object'||
    !Array.isArray(attempts) ||
    typeof tries !== 'number' ||
    isNaN(tries) ||
    !attempts.length
  ) {
    return false;
  }
  if (tries > 6) {
    return last !== attempts[attempts.length-1];
  }
  if (
    attempts[attempts.length-1] !== last ||
    tries !== attempts.length 
  ) {
    return false
  }
  return attempts.every(validTry)
}

export default validBlocks;