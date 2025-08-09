/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import calculateScore from './calculateScore'
import { options as juiceShopOptions } from './options'

/* The hint costs depend on the kind of hint and the difficulty of the challenge they are for:
 paid text hint             = 10% of the challenge's score value
 paid url hint              = 20% of the challenge's score value
 paid code snippet hint     = 30% of the challenge's score value
 free text/url/snippet hint = free (as in free beer)
 */
interface Challenge {
  difficulty: number
}

type HintOption = typeof juiceShopOptions.paidTextHints | typeof juiceShopOptions.paidHintUrls | typeof juiceShopOptions.paidHintSnippets

function calculateHintCost ({ difficulty }: Challenge, hintOption: HintOption): number {
  let costMultiplier = 0
  if (hintOption === juiceShopOptions.paidTextHints) {
    costMultiplier = 0.1
  } else if (hintOption === juiceShopOptions.paidHintUrls) {
    costMultiplier = 0.2
  } else if (hintOption === juiceShopOptions.paidHintSnippets) {
    costMultiplier = 0.3
  }
  return costMultiplier * calculateScore(difficulty)
}
export default calculateHintCost
