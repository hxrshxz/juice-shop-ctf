/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { it, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import rewire from 'rewire'

const generateDataModule = rewire('../../lib/generators/ctfd')
const generateData = generateDataModule.default || generateDataModule
import options from '../../lib/options'

interface CtfdChallenge {
  name: string
  description: string
  category: string
  value: number
  type: string
  state: string
  max_attempts: number
  flags: string
  tags: string
  hints: string
  type_data: string
}

interface Challenge {
  id: number
  key: string
  name: string
  description: string
  difficulty: number
  category: string
  tags: string | null
  hint?: string
  hintUrl?: string
}

const defaultOptions = { 
  insertHints: options.noTextHints, 
  insertHintUrls: options.noHintUrls, 
  ctfKey: '', 
  vulnSnippets: {} 
}

const generateOptions = (insertHints = options.noTextHints, insertHintUrls = options.noHintUrls) => ({
  insertHints,
  insertHintUrls,
  ctfKey: '',
  vulnSnippets: {}
})

let challenges: Record<string, Challenge>

const sampleChallenges = () => ({
  c1: { id: 1, key: 'k1', name: 'c1', description: 'C1', difficulty: 1, category: '1', tags: 'foo,bar' },
  c2: { id: 2, key: 'k2', name: 'c2', description: 'C2', difficulty: 2, category: '2', tags: null },
  c3: { id: 3, key: 'k3', name: 'c3', description: 'C3', difficulty: 3, category: '2', tags: 'foo' },
  c4: { id: 4, key: 'k4', name: 'c4', description: 'C4', difficulty: 4, category: '3', tags: null },
  c5: { id: 5, key: 'k5', name: 'c5', description: 'C5', difficulty: 5, category: '1', tags: 'foo,bar,baz' }
})

describe('Generated CTFd data', () => {
  beforeEach(() => {
    challenges = sampleChallenges()
  })

  it('should consist of one object pushed into result per challenge', async () => {
    const result = await generateData(challenges, defaultOptions)
    assert.deepEqual(result, [
      { name: 'c1', description: '"C1 (Difficulty Level: 1)"', category: '1', value: 100, type: 'standard', state: 'visible', max_attempts: 0, flags: '958c64658383140e7d08d5dee091009cc0eafc1f', tags: '"foo,bar"', hints: '', type_data: '' },
      { name: 'c2', description: '"C2 (Difficulty Level: 2)"', category: '2', value: 250, type: 'standard', state: 'visible', max_attempts: 0, flags: '49294e8b829f5b053f748facad22825ccb4bf420', tags: '', hints: '', type_data: '' },
      { name: 'c3', description: '"C3 (Difficulty Level: 3)"', category: '2', value: 450, type: 'standard', state: 'visible', max_attempts: 0, flags: 'aae3acb6eff2000c0e12af0d0d875d0bdbf4ca81', tags: '"foo"', hints: '', type_data: '' },
      { name: 'c4', description: '"C4 (Difficulty Level: 4)"', category: '3', value: 700, type: 'standard', state: 'visible', max_attempts: 0, flags: '4e2b98db86cc32c56cba287db411198534af4ab6', tags: '', hints: '', type_data: '' },
      { name: 'c5', description: '"C5 (Difficulty Level: 5)"', category: '1', value: 1000, type: 'standard', state: 'visible', max_attempts: 0, flags: '554df67c6c0b6a99efecaec4fe2ced73b7b5be60', tags: '"foo,bar,baz"', hints: '', type_data: '' }
    ])
  })

  it('should be empty when given no challenges', async () => {
    const result = await generateData({}, defaultOptions)
    assert.deepEqual(result, [])
  })

  it('should log generator error to console', async () => {
    await assert.rejects(
      () => generateData({ c1: undefined }, defaultOptions), 
      /Failed to generate challenge data! Cannot read properties of undefined/
    )
  })

  it('should insert free and paid text hints correctly', async () => {
    challenges.c3.hint = 'hint'
    const free = await generateData(challenges, generateOptions(options.freeTextHints))
    assert.ok(free.some((c: CtfdChallenge) => c.name === 'c3' && c.hints.includes('"hint"') && c.hints.includes('0')))

    const paid = await generateData(challenges, generateOptions(options.paidTextHints))
    assert.ok(paid.some((c: CtfdChallenge) => c.name === 'c3' && c.hints.includes('"hint"') && c.hints.includes('45')))
  })

  it('should respect hint penalty insertion', async () => {
    const challenge = { id: 1, key: 'k1', name: 'c1', description: 'C1', difficulty: 1, category: '1', tags: 'foo,bar', hint: 'hint1' }
    const result = await generateData({ c1: challenge }, generateOptions(options.paidTextHints))
    assert.ok(result.some((c: CtfdChallenge) => c.name === 'c1' && c.hints.includes('"hint1"') && c.hints.includes('10')))
  })

  it('should respect hint URL penalty insertion', async () => {
    const challenge = { id: 1, key: 'k1', name: 'c1', description: 'C1', difficulty: 1, category: '1', tags: 'foo,bar', hintUrl: 'https://hint1.com' }
    const result = await generateData({ c1: challenge }, generateOptions(options.noTextHints, options.paidHintUrls))
    assert.ok(result.some((c: CtfdChallenge) => c.name === 'c1' && c.hints.includes('"https://hint1.com"') && c.hints.includes('20')))
  })

  it('should not insert text hints when not enabled', async () => {
    challenges.c1.hint = 'hint'
    challenges.c2.hint = 'hint'
    const result = await generateData(challenges, defaultOptions)
    assert.strictEqual(result.find((c: CtfdChallenge) => c.name === 'c1')?.hints, '')
    assert.strictEqual(result.find((c: CtfdChallenge) => c.name === 'c2')?.hints, '')
  })

  it('should not insert  hint URLs when not enabled', async () => {
    challenges.c1.hintUrl = 'hintUrl'
    challenges.c2.hintUrl = 'hintUrl'
    const result = await generateData(challenges, defaultOptions)
    assert.strictEqual(result.find((c: CtfdChallenge) => c.name === 'c1')?.hints, '')
    assert.strictEqual(result.find((c: CtfdChallenge) => c.name === 'c2')?.hints, '')
  })
})  