/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as https from 'https'
import * as yaml from 'js-yaml'

type CountryMapping = Record<string, string>

async function fetchChallenges (
  challengeMapFile: string | undefined,
  ignoreSslWarnings: boolean
): Promise<CountryMapping | undefined> {
  if (challengeMapFile === undefined || challengeMapFile.length === 0) {
    await Promise.resolve()
    return undefined
  }

  const agent = ignoreSslWarnings
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined

  const fetchOptions: RequestInit & { agent?: https.Agent } = {
    agent
  }
  try {
    const response = await fetch(challengeMapFile, fetchOptions)
    const text = await response.text()
    const data = yaml.loadAll(text) as Array<{
      ctf: {
        countryMapping: CountryMapping
      }
    }>
    return data[0].ctf.countryMapping
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    throw new Error('Failed to fetch country mapping from API! ' + errorMessage)
  }
}

export = fetchChallenges
