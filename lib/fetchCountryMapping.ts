/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as https from 'node:https';
import yaml from 'js-yaml';
import type { CountryMapping } from './types/types';

async function fetchCountryMapping(
  challengeMapFile?: string,
  ignoreSslWarnings?: boolean,
  { fetch = globalThis.fetch } = { fetch: globalThis.fetch }
): Promise<CountryMapping> {
  if (!challengeMapFile) {
    return {};
  }

  const agent = ignoreSslWarnings
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined
  const options = { agent };
 
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

export default fetchCountryMapping;
