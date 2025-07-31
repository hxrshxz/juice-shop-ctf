/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as https from 'https'

interface FetchOptions {
  juiceShopUrl: string
  ignoreSslWarnings?: boolean
  skip?: boolean
}

interface SnippetsApiResponse {
  challenges: string[]
}

interface SnippetApiResponse {
  snippet: string
}

async function fetchCodeSnippets (options: string | FetchOptions): Promise<Record<string, string>> {
  const juiceShopUrl = typeof options === 'string' ? options : options.juiceShopUrl
  const ignoreSslWarnings = typeof options === 'string' ? false : options.ignoreSslWarnings === true
  const skip = typeof options === 'string' ? false : options.skip === true

  if (skip) {
    return {}
  }

  const agent = ignoreSslWarnings
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined

  const fetchOptions = agent ? {
    signal: undefined,  // To satisfy RequestInit interface
    dispatcher: {
      httpsAgent: agent
    }
  } : undefined

  try {
    const challengesResponse = await fetch(`${juiceShopUrl}/snippets`, fetchOptions)

    if (!challengesResponse.ok) {
      throw new Error(`Snippets API returned status ${challengesResponse.status}`)
    }

    const responseData = await challengesResponse.json() as SnippetsApiResponse

    if (!responseData.challenges || !Array.isArray(responseData.challenges)) {
      throw new Error('Invalid challenges format in response')
    }

    const { challenges } = responseData
    const snippets: Record<string, string> = {}

    // Fetch each snippet
    for (const challengeKey of challenges) {
      const snippetRes = await fetch(`${juiceShopUrl}/snippets/${challengeKey}`, fetchOptions)

      if (!snippetRes.ok) {
        continue
      }

      const snippetData = await snippetRes.json() as SnippetApiResponse

      if (snippetData.snippet) {
        snippets[challengeKey] = snippetData.snippet
      }
    }

    return snippets
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error('Failed to fetch snippet from API! ' + errorMessage)
  }
}

export = fetchCodeSnippets