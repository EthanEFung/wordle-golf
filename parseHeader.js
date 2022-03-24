
function parseHeader(text) {
  const [name, id, triesOfSix] = text.split(" ")
  if (
    name !== "Wordle" ||
    id === undefined ||
    isNaN(Number(id))||
    triesOfSix === undefined ||
    triesOfSix.indexOf("/6") !== 1 ||
    (/1|2|3|4|5|6|X/.test(triesOfSix[0]) === false)
  ) {
    return {
      valid: false,
      score: 7,
      id: NaN,
    }
  }
  let score = Number(triesOfSix[0])
  if (isNaN(score)) {
    score = 7
  }
  return {
    valid: true,
    id: Number(id),
    score,
  }
}

export default parseHeader