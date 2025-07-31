/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import colors from 'colors/safe'
import inquirer from 'inquirer'
import fetchSecretKey from './lib/fetchSecretKey'
import fetchChallenges from './lib/fetchChallenges'
import fetchCountryMapping from './lib/fetchCountryMapping'
import fetchCodeSnippets from './lib/fetchCodeSnippets'
import readConfigStream from './lib/readConfigStream'
import * as options from './lib/options'
import * as fs from 'fs'
import generateCtfExport from './lib/generators/'
import yargs from 'yargs'

const argv = yargs
  .option('config', {
    alias: 'c',
    describe: 'provide a configuration file',
    type: 'string'
  })
  .option('output', {
    alias: 'o',
    describe: 'change the output file',
    type: 'string'
  })
  .option('ignoreSslWarnings', {
    alias: 'i',
    describe: 'ignore tls certificate warnings',
    type: 'boolean'
  })
  .help()
  .argv as { config?: string, output?: string, ignoreSslWarnings?: boolean }

const DEFAULT_JUICE_SHOP_URL = process.env.DEFAULT_JUICE_SHOP_URL ?? 'https://juice-shop.herokuapp.com'

const questions = [
  {
    type: 'list',
    name: 'ctfFramework',
    message: 'CTF framework to generate data for?',
    choices: [options.ctfdFramework, options.fbctfFramework, options.rtbFramework],
    default: 0
  },
  {
    type: 'input',
    name: 'juiceShopUrl',
    message: 'Juice Shop URL to retrieve challenges?',
    default: DEFAULT_JUICE_SHOP_URL
  },
  {
    type: 'input',
    name: 'ctfKey',
    message: 'URL to ctf.key file <or> secret key <or> (CTFd only) comma-separated list of secret keys?',
    default: 'https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key'
  },
  {
    type: 'input',
    name: 'countryMapping',
    message: 'URL to country-mapping.yml file?',
    default: 'https://raw.githubusercontent.com/juice-shop/juice-shop/master/config/fbctf.yml',
    when: ({ ctfFramework }: { ctfFramework: string }) => ctfFramework === options.fbctfFramework
  },
  {
    type: 'list',
    name: 'insertHints',
    message: 'Insert a text hint along with each challenge?',
    choices: [options.noTextHints, options.freeTextHints, options.paidTextHints],
    default: 0
  },
  {
    type: 'list',
    name: 'insertHintUrls',
    message: 'Insert a hint URL along with each challenge?',
    choices: [options.noHintUrls, options.freeHintUrls, options.paidHintUrls],
    default: 0
  },
  {
    type: 'list',
    name: 'insertHintSnippets',
    message: 'Insert a code snippet as hint for each challenge?',
    choices: [options.noHintSnippets, options.freeHintSnippets, options.paidHintSnippets],
    default: 0
  }
]

interface ConfigAnswers {
  ctfFramework: string
  juiceShopUrl: string
  ctfKey: string
  countryMapping?: string
  insertHints: string
  insertHintUrls: string
  insertHintSnippets: string
}

interface Challenge {
  id: number
  name: string
  description: string
  difficulty: number
  category: string
  [key: string]: any
}

interface Argv {
  config?: string
  output?: string
  ignoreSslWarnings?: boolean
}

async function getConfig (
  argv: Argv,
  questions: Array<Record<string, any>>
): Promise<ConfigAnswers> {
  if (argv.config != null && argv.config !== '') {
    return await readConfigStream(fs.createReadStream(argv.config)).then((config: any) => ({
      ctfFramework: config.ctfFramework ?? options.ctfdFramework,
      juiceShopUrl: config.juiceShopUrl,
      ctfKey: config.ctfKey,
      countryMapping: config.countryMapping,
      insertHints: config.insertHints,
      insertHintUrls: config.insertHintUrls,
      insertHintSnippets: config.insertHintSnippets
    }))
  }
  return await inquirer.prompt<ConfigAnswers>(questions)
}

const juiceShopCtfCli = async (): Promise<void> => {
  console.log()
  const juiceShopBold = colors.bold('OWASP Juice Shop')
  const ctfdFrameworkBold = colors.bold(options.ctfdFramework)
  const fbctfFrameworkBold = colors.bold(options.fbctfFramework)
  const rtbFrameworkBold = colors.bold(options.rtbFramework)

  console.log(`Generate ${juiceShopBold} challenge archive for setting up ${ctfdFrameworkBold}, ${fbctfFrameworkBold} or ${rtbFrameworkBold} score server`)

  try {
    const resolvedArgv = await Promise.resolve(argv)
    const answers = await getConfig(resolvedArgv, questions)

    console.log()

    // Only fetch snippets if user wants them
    const shouldFetchSnippets = answers.insertHintSnippets !== options.noHintSnippets

    // Prepare fetch operations
    const fetchOperations = [
      fetchSecretKey(answers.ctfKey ?? '', resolvedArgv.ignoreSslWarnings ?? false),
      fetchChallenges(answers.juiceShopUrl, resolvedArgv.ignoreSslWarnings ?? false),
      fetchCountryMapping(answers.countryMapping ?? '', resolvedArgv.ignoreSslWarnings ?? false)
    ]

    // Conditionally add snippets fetch
    if (shouldFetchSnippets) {
      fetchOperations.push(
        fetchCodeSnippets({
          juiceShopUrl: answers.juiceShopUrl,
          ignoreSslWarnings: resolvedArgv.ignoreSslWarnings ?? false
        }).catch((error: Error): Record<string, unknown> => {
          console.log(colors.yellow(`Warning: ${error.message}`))
          return {} // Return empty object on error to continue process
        })
      )
    }

    const [fetchedSecretKey, challenges, countryMapping, vulnSnippets] = await Promise.all(fetchOperations) as [string, Challenge[], object, object]

    const snippets = shouldFetchSnippets ? vulnSnippets : {}

    await generateCtfExport(answers.ctfFramework ?? options.ctfdFramework, challenges, {
      juiceShopUrl: answers.juiceShopUrl,
      insertHints: answers.insertHints,
      insertHintUrls: answers.insertHintUrls,
      insertHintSnippets: answers.insertHintSnippets,
      ctfKey: fetchedSecretKey,
      countryMapping,
      vulnSnippets: snippets,
      outputLocation: resolvedArgv.output ?? 'OWASP_Juice_Shop.CTF-*.zip'
    })
  } catch (err) {
    console.error('Failed to write output to file!', err)
  }
}

export = juiceShopCtfCli
