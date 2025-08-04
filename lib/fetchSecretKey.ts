/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import isUrl from './url'
import * as https from 'https'

async function fetchSecretKey (origin: string, ignoreSslWarnings: boolean = false): Promise<string | undefined> {
  const agent = ignoreSslWarnings
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (origin && isUrl(origin)) {
    try {
      const fetchOptions: RequestInit & { agent?: https.Agent } = { agent }
      const response = await fetch(origin, fetchOptions)

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
      }

      const body = await response.text()
      return body
    } catch (err) {
      throw new Error(
        'Failed to fetch secret key from URL! ' +
          (err instanceof Error ? err.message : String(err))
      )
    }
  } else {
    return origin
  }
}
export = fetchSecretKey
