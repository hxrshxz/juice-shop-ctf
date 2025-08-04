/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import 'colors'
import calculateHintCost from '../calculateHintCost'
import calculateScore from '../calculateScore'
import FBCTF_TEMPLATE from '../../data/fbctfImportTemplate.json'

const { hash } = require('bcryptjs')
const { readFile } = require('fs')
const path = require('path')
const fbctfOptions = require('../options')
const hmac = require('../hmac')

type GenerateRandomString = (length: number) => string

const generateRandomString: GenerateRandomString = function (length: number): string {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }

  return text
}

interface DummyUser {
  name: string
  active: boolean
  admin: boolean
  protected: boolean
  visible: boolean
  password_hash: string
  points: number
  logo: string
  data: Record<string, unknown>
}

async function createDummyUser (): Promise<DummyUser> {
  const SALT_ROUNDS = 12
  return {
    name: generateRandomString(32),
    active: false,
    admin: false,
    protected: false,
    visible: false,
    password_hash: await hash(generateRandomString(32), SALT_ROUNDS),
    points: 0,
    logo: '4chan-2',
    data: {}
  }
}

interface Challenge {
  key: string
  name: string
  description: string
  difficulty: number
  hint: string
  hintUrl: string
}

interface Country {
  code: string
}

interface FbctfExportOptions {
  insertHints: string
  insertHintUrls: string
  insertHintSnippets: string
  ctfKey: string
  countryMapping: Record<string, Country>
  vulnSnippets: Record<string, string>
}

interface FbctfLevel {
  type: string
  title: string
  active: boolean
  description: string
  entity_iso_code: string
  category: string
  points: number
  bonus: number
  bonus_dec: number
  bonus_fix: number
  flag: string
  hint: string
  penalty: number
  links: unknown[]
  attachments: unknown[]
}

interface FbctfTemplate {
  teams: {
    teams: DummyUser[]
  }
  levels: {
    levels: FbctfLevel[]
  }
}

async function createFbctfExport (
  challenges: Challenge[],
  {
    insertHints,
    insertHintUrls,
    insertHintSnippets,
    ctfKey,
    countryMapping,
    vulnSnippets
  }: FbctfExportOptions
): Promise<FbctfTemplate> {
  const fbctfTemplate: FbctfTemplate = FBCTF_TEMPLATE

  fbctfTemplate.teams.teams.push(await createDummyUser())

  // Add all challenges
  const mappedLevels = challenges.map(({ key, name, description, difficulty, hint, hintUrl }) => {
    const country = countryMapping[key]
    if (country === undefined) {
      console.warn(`Challenge "${name}" does not have a country mapping and will not appear in the CTF game!`.yellow)
      return null
    }

    const hintText: string[] = []
    if (insertHints !== fbctfOptions.noTextHints && hint !== undefined && hint !== null && hint !== '') {
      hintText.push(hint)
    }
    if (insertHintUrls !== fbctfOptions.noHintUrls && hintUrl !== undefined && hintUrl !== null && hintUrl !== '') {
      hintText.push(hintUrl)
    }
    if (insertHintSnippets !== fbctfOptions.noHintSnippets &&
        vulnSnippets[key] !== undefined && vulnSnippets[key] !== null && vulnSnippets[key] !== '') {
      hintText.push(vulnSnippets[key])
    }

    return {
      type: 'flag',
      title: name,
      active: true,
      description,
      entity_iso_code: country.code,
      category: `Difficulty ${difficulty}`,
      points: calculateScore(difficulty),
      bonus: 0,
      bonus_dec: 0,
      bonus_fix: 0,
      flag: hmac(ctfKey, name),
      hint: hintText.join('\n\n'),
      penalty: calculateHintCost({ difficulty }, insertHints) + calculateHintCost({ difficulty }, insertHintUrls) + calculateHintCost({ difficulty }, insertHintSnippets),
      links: [],
      attachments: []
    } as FbctfLevel
  })

  fbctfTemplate.levels.levels = mappedLevels.filter((level): level is FbctfLevel => level !== null)

  return fbctfTemplate
}

export = createFbctfExport
