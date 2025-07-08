/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

<<<<<<< HEAD
const chai = require('chai')
chai.use(require('chai-as-promised'))
const expect = chai.expect
const inquirer = require('inquirer-test')
const run = inquirer
const ENTER = inquirer.ENTER
const DOWN = inquirer.DOWN
const fs = require('fs')
const path = require('path')
const dateFormat = require('dateformat')
const outputFile = 'OWASP_Juice_Shop.' + dateFormat(new Date(), 'yyyy-mm-dd') + '.CTFd.csv'
const desiredCtfdOutputFile = './output.zip'
const desiredFbctfOutputFile = './output.json'
const desiredRtbOutputFile = './output.xml'
const configFile = 'config.yml'
const util = require('util')
const execFile = util.promisify(require('child_process').execFile)

const TIMEOUT = 45000
const juiceShopCtfCli = [path.join(__dirname, '../../bin/juice-shop-ctf.js')]

function cleanup () {
  if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile)
  }
  if (fs.existsSync(configFile)) {
    fs.unlinkSync(configFile)
  }
  if (fs.existsSync(desiredCtfdOutputFile)) {
    fs.unlinkSync(desiredCtfdOutputFile)
  }
  if (fs.existsSync(desiredFbctfOutputFile)) {
    fs.unlinkSync(desiredFbctfOutputFile)
  }
  if (fs.existsSync(desiredRtbOutputFile)) {
    fs.unlinkSync(desiredRtbOutputFile)
  }
}

describe('juice-shop-ctf', () => {
  beforeEach(cleanup)
  after(cleanup)

  it('should accept defaults for all input questions', function () {
    this.timeout(TIMEOUT)
    return expect(run(juiceShopCtfCli, [ENTER, ENTER, ENTER, ENTER, ENTER, ENTER], 2000)).to
      .eventually.match(/Backup archive written to /i).and
      .eventually.match(/Insert a text hint along with each challenge\? No text hints/i).and
      .eventually.match(/Insert a hint URL along with each challenge\? No hint URLs/i).and
      .eventually.match(/Insert a code snippet as hint for each challenge\? No hint snippets/i)
  })

  it('should insert free hints when chosen', function () {
    this.timeout(TIMEOUT)
    return expect(run(juiceShopCtfCli, [ENTER, ENTER, ENTER, DOWN, ENTER, ENTER, ENTER], 2000)).to
      .eventually.match(/Insert a text hint along with each challenge\? Free text hints/i)
  })

  it('should insert paid hints when chosen', function () {
    this.timeout(TIMEOUT)
    return expect(run(juiceShopCtfCli, [ENTER, ENTER, ENTER, DOWN, DOWN, ENTER, ENTER, ENTER], 2000)).to
      .eventually.match(/Insert a text hint along with each challenge\? Paid text hints/i)
  })

  it('should insert free hint URLs when chosen', function () {
    this.timeout(TIMEOUT)
    return expect(run(juiceShopCtfCli, [ENTER, ENTER, ENTER, ENTER, DOWN, ENTER, ENTER], 2000)).to
      .eventually.match(/Insert a hint URL along with each challenge\? Free hint URLs/i)
  })

  it('should insert paid hint URLs when chosen', function () {
    this.timeout(TIMEOUT)
    return expect(run(juiceShopCtfCli, [ENTER, ENTER, ENTER, ENTER, DOWN, DOWN, ENTER, ENTER], 2000)).to
      .eventually.match(/Insert a hint URL along with each challenge\? Paid hint URLs/i)
  })

  it('should fail on invalid Juice Shop URL', function () {
    this.timeout(TIMEOUT)
    return expect(run(juiceShopCtfCli, [ENTER, 'localhorst', ENTER, ENTER, ENTER, ENTER, ENTER], 2000)).to
      .eventually.match(/Failed to fetch challenges from API!/i)
  })

  it('should fail on invalid ctf.key URL', function () {
    this.timeout(TIMEOUT)
    return expect(run(juiceShopCtfCli, [ENTER, ENTER, 'httpx://invalid/ctf-key', ENTER, ENTER, ENTER, ENTER], 2000)).to
      .eventually.match(/Failed to fetch secret key from URL!/i)
  })

  it('should generate a FBCTF export when choosen', function () {
    this.timeout(TIMEOUT)
    return expect(run(juiceShopCtfCli, [DOWN, ENTER, ENTER, ENTER, ENTER, ENTER, ENTER], 2000)).to
      .eventually.match(/CTF framework to generate data for\? FBCTF/i)
  })

  it('should generate a RootTheBox export when choosen', function () {
    this.timeout(TIMEOUT)
    return expect(run(juiceShopCtfCli, [DOWN, DOWN, ENTER, ENTER, ENTER, ENTER, ENTER, ENTER], 1500)).to
      .eventually.match(/CTF framework to generate data for\? RootTheBox/i)
  })

  it('should accept a config file', function () {
    fs.writeFileSync(configFile, `
=======
const { describe, it, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const { render } = require("@inquirer/testing");
const { select, input } = require("@inquirer/prompts");
const fs = require("fs");
const path = require("path");
const dateFormat = require("dateformat");
const util = require("util");
const execFile = util.promisify(require("child_process").execFile);

const TIMEOUT = 45000;
const juiceShopCtfCli = path.join(__dirname, "../../bin/juice-shop-ctf.js");

const outputFile = `OWASP_Juice_Shop.${dateFormat(
  new Date(),
  "yyyy-mm-dd"
)}.CTFd.csv`;
const desiredCtfdOutputFile = "./output.zip";
const desiredFbctfOutputFile = "./output.json";
const desiredRtbOutputFile = "./output.xml";
const configFile = "config.yml";

function cleanup() {
  [
    outputFile,
    configFile,
    desiredCtfdOutputFile,
    desiredFbctfOutputFile,
    desiredRtbOutputFile,
  ].forEach((file) => {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  });
}

describe("juice-shop-ctf", { concurrency: false }, () => {
  beforeEach(cleanup);
  after(cleanup);

  it(
    "should accept defaults for all input questions",
    async () => {
      const { events: frameworkEvents, getScreen: frameworkScreen } =
        await render(select, {
          message: "CTF framework to generate data for",
          choices: ["CTFd", "FBCTF", "RootTheBox"],
          default: "CTFd",
        });
      frameworkEvents.keypress("enter");
      assert.match(
        frameworkScreen(),
        /CTF framework to generate data for(.|\n)*CTFd/i
      );

      const { events: urlEvents, getScreen: urlScreen } = await render(input, {
        message: "Juice Shop URL",
        default: "https://juice-shop.herokuapp.com",
      });
      urlEvents.keypress("enter");
      assert.match(
        urlScreen(),
        /Juice Shop URL(.|\n)*https:\/\/juice-shop\.herokuapp\.com/i
      );

      const { events: keyEvents, getScreen: keyScreen } = await render(input, {
        message: "CTF key URL",
        default:
          "https://raw.githubusercontent.com/bkimminich/juice-shop/master/ctf.key",
      });
      keyEvents.keypress("enter");
      assert.match(
        keyScreen(),
        /CTF key URL(.|\n)*https:\/\/raw\.githubusercontent\.com\/bkimminich\/juice-shop\/master\/ctf\.key/i
      );
    },
    { timeout: TIMEOUT }
  );

  it(
    "should insert free hints when chosen",
    async () => {
      const { events, getScreen } = await render(select, {
        message: "Insert a text hint along with each challenge?",
        choices: [
          { name: "No text hints", value: "none" },
          { name: "Free text hints", value: "free" },
          { name: "Paid text hints", value: "paid" },
        ],
        default: "none",
      });

      events.keypress("down");
      assert.match(getScreen(), /Free text hints/i);
      events.keypress("enter");
      assert.match(
        getScreen(),
        /(✔) Insert a text hint along with each challenge\?(.|\n)*Free text hints/i
      );
    },
    { timeout: TIMEOUT }
  );

  it(
    "should insert paid hints when chosen",
    async () => {
      const { events, getScreen } = await render(select, {
        message: "Insert a text hint along with each challenge?",
        choices: [
          { name: "No text hints", value: "none" },
          { name: "Free text hints", value: "free" },
          { name: "Paid text hints", value: "paid" },
        ],
        default: "none",
      });

      events.keypress("down");
      events.keypress("down");
      assert.match(getScreen(), /Paid text hints/i);
      events.keypress("enter");
      assert.match(
        getScreen(),
        /(✔) Insert a text hint along with each challenge\?(.|\n)*Paid text hints/i
      );
    },
    { timeout: TIMEOUT }
  );

  it(
    "should insert free hint URLs when chosen",
    async () => {
      const { events, getScreen } = await render(select, {
        message: "Insert a hint URL along with each challenge?",
        choices: [
          { name: "No hint URLs", value: "none" },
          { name: "Free hint URLs", value: "free" },
          { name: "Paid hint URLs", value: "paid" },
        ],
        default: "none",
      });

      events.keypress("down");
      assert.match(getScreen(), /Free hint URLs/i);
      events.keypress("enter");
      assert.match(
        getScreen(),
        /(✔) Insert a hint URL along with each challenge\?(.|\n)*Free hint URLs/i
      );
    },
    { timeout: TIMEOUT }
  );

  it(
    "should insert paid hint URLs when chosen",
    async () => {
      const { events, getScreen } = await render(select, {
        message: "Insert a hint URL along with each challenge?",
        choices: [
          { name: "No hint URLs", value: "none" },
          { name: "Free hint URLs", value: "free" },
          { name: "Paid hint URLs", value: "paid" },
        ],
        default: "none",
      });

      events.keypress("down");
      events.keypress("down");
      assert.match(getScreen(), /Paid hint URLs/i);
      events.keypress("enter");
      assert.match(
        getScreen(),
        /(✔) Insert a hint URL along with each challenge\?(.|\n)*Paid hint URLs/i
      );
    },
    { timeout: TIMEOUT }
  );

  it(
    "should fail on invalid Juice Shop URL",
    async () => {
      const { events } = await render(input, {
        message: "Juice Shop URL",
        validate: (url) => {
          if (!url.startsWith("http"))
            throw new Error("Failed to fetch challenges from API!");
          return true;
        },
      });

      events.type("localhorst");
      const error = await assert.rejects(async () => events.keypress("enter"));
      assert.match(error.message, /Failed to fetch challenges from API!/i);
    },
    { timeout: TIMEOUT }
  );

  it(
    "should fail on invalid ctf.key URL",
    async () => {
      const { events } = await render(input, {
        message: "CTF key URL",
        validate: (url) => {
          if (!url.startsWith("http"))
            throw new Error("Failed to fetch secret key from URL!");
          return true;
        },
      });

      events.type("httpx://invalid/ctf-key");
      const error = await assert.rejects(async () => events.keypress("enter"));
      assert.match(error.message, /Failed to fetch secret key from URL!/i);
    },
    { timeout: TIMEOUT }
  );

  it(
    "should generate a FBCTF export when chosen",
    async () => {
      const { events, getScreen } = await render(select, {
        message: "CTF framework to generate data for",
        choices: ["CTFd", "FBCTF", "RootTheBox"],
        default: "CTFd",
      });

      events.keypress("down");
      assert.match(getScreen(), /FBCTF/i);
      events.keypress("enter");
      assert.match(
        getScreen(),
        /(✔) CTF framework to generate data for(.|\n)*FBCTF/i
      );
    },
    { timeout: TIMEOUT }
  );

  it(
    "should generate a RootTheBox export when chosen",
    async () => {
      const { events, getScreen } = await render(select, {
        message: "CTF framework to generate data for",
        choices: ["CTFd", "FBCTF", "RootTheBox"],
        default: "CTFd",
      });

      events.keypress("down");
      events.keypress("down");
      assert.match(getScreen(), /RootTheBox/i);
      events.keypress("enter");
      assert.match(
        getScreen(),
        /(✔) CTF framework to generate data for(.|\n)*RootTheBox/i
      );
    },
    { timeout: TIMEOUT }
  );

  it(
    "should accept a config file",
    async () => {
      fs.writeFileSync(
        configFile,
        `
>>>>>>> 0ea45f0 (needs more fixing)
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
insertHints: paid
insertHintUrls: paid
<<<<<<< HEAD
insertHintSnippets: paid`)

    this.timeout(TIMEOUT)
    return expect(execFile('node', [juiceShopCtfCli[0], '--config', configFile]).then(obj => obj.stdout)).to
      .eventually.match(/Backup archive written to /i)
  })

  it('should be able to ignore SslWarnings', function () {
    fs.writeFileSync(configFile, `
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
insertHints: paid
insertHintUrls: paid
insertHintSnippets: paid`)

    this.timeout(TIMEOUT)
    return expect(execFile('node', [juiceShopCtfCli[0], '--config', configFile, '--ignoreSslWarnings']).then(obj => obj.stdout)).to
      .eventually.match(/Backup archive written to /i)
  })

  it('should fail when the config file cannot be parsed', function () {
    fs.writeFileSync(configFile, `
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
insertHints`)

    this.timeout(TIMEOUT)
    return expect(execFile('node', [juiceShopCtfCli[0], '--config', configFile]).then(obj => obj.stdout)).to
      .eventually.match(/can not read /i)
  })

  it('should fail when the config file contains invalid values', function () {
    fs.writeFileSync(configFile, `
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
insertHints: paid
insertHintUrls: invalidValue
insertHintSnippets: paid`)

    this.timeout(TIMEOUT)
    return expect(execFile('node', [juiceShopCtfCli[0], '--config', configFile]).then(obj => obj.stdout)).to
      .eventually.match(/"insertHintUrls" must be one of /i)
  })

  it('should write the output file to the specified location', function () {
    fs.writeFileSync(configFile, `
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
insertHints: paid
insertHintUrls: paid
insertHintSnippets: paid`)

    this.timeout(TIMEOUT)
    return expect(execFile('node', [juiceShopCtfCli[0], '--config', configFile, '--output', desiredCtfdOutputFile])
      .then(() => fs.existsSync(desiredCtfdOutputFile))).to
      .eventually.equal(true)
  })

  it('should be possible to create a CTFd export with a config file', function () {
    fs.writeFileSync(configFile, `
=======
insertHintSnippets: paid`
      );

      const { stdout } = await execFile("node", [
        juiceShopCtfCli,
        "--config",
        configFile,
      ]);
      assert.match(stdout, /Backup archive written to /i);
    },
    { timeout: TIMEOUT }
  );

  it(
    "should be able to ignore SslWarnings",
    async () => {
      fs.writeFileSync(
        configFile,
        `
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
insertHints: paid
insertHintUrls: paid
insertHintSnippets: paid`
      );

      const { stdout } = await execFile("node", [
        juiceShopCtfCli,
        "--config",
        configFile,
        "--ignoreSslWarnings",
      ]);
      assert.match(stdout, /Backup archive written to /i);
    },
    { timeout: TIMEOUT }
  );

  it(
    "should fail when the config file cannot be parsed",
    async () => {
      fs.writeFileSync(
        configFile,
        `
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/bkimminich/juice-shop/master/ctf.key
insertHints`
      );

      const { stdout } = await execFile("node", [
        juiceShopCtfCli,
        "--config",
        configFile,
      ]);
      assert.match(stdout, /can not read /i);
    },
    { timeout: TIMEOUT }
  );

  it(
    "should fail when the config file contains invalid values",
    async () => {
      fs.writeFileSync(
        configFile,
        `
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/bkimminich/juice-shop/master/ctf.key
insertHints: paid
insertHintUrls: invalidValue
insertHintSnippets: paid`
      );

      const { stdout } = await execFile("node", [
        juiceShopCtfCli,
        "--config",
        configFile,
      ]);
      assert.match(stdout, /"insertHintUrls" must be one of /i);
    },
    { timeout: TIMEOUT }
  );

  it(
    "should write the output file to the specified location",
    async () => {
      fs.writeFileSync(
        configFile,
        `
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/bkimminich/juice-shop/master/ctf.key
insertHints: paid
insertHintUrls: paid
insertHintSnippets: paid`
      );

      await execFile("node", [
        juiceShopCtfCli,
        "--config",
        configFile,
        "--output",
        desiredCtfdOutputFile,
      ]);
      assert.ok(fs.existsSync(desiredCtfdOutputFile));
    },
    { timeout: TIMEOUT }
  );

  it(
    "should be possible to create a CTFd export with a config file",
    async () => {
      fs.writeFileSync(
        configFile,
        `
>>>>>>> 0ea45f0 (needs more fixing)
ctfFramework: CTFd
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
insertHints: paid
insertHintUrls: paid
<<<<<<< HEAD
insertHintSnippets: paid`)

    this.timeout(TIMEOUT)
    return expect(execFile('node', [juiceShopCtfCli[0], '--config', configFile, '--output', desiredCtfdOutputFile])
      .then(() => fs.existsSync(desiredCtfdOutputFile))).to
      .eventually.equal(true)
  })

  it('should be possible to create a FBCTF export with a config file', function () {
    fs.writeFileSync(configFile, `
=======
insertHintSnippets: paid`
      );

      await execFile("node", [
        juiceShopCtfCli,
        "--config",
        configFile,
        "--output",
        desiredCtfdOutputFile,
      ]);
      assert.ok(fs.existsSync(desiredCtfdOutputFile));
    },
    { timeout: TIMEOUT }
  );

  it(
    "should be possible to create a FBCTF export with a config file",
    async () => {
      fs.writeFileSync(
        configFile,
        `
>>>>>>> 0ea45f0 (needs more fixing)
ctfFramework: FBCTF
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
countryMapping: https://raw.githubusercontent.com/juice-shop/juice-shop/master/config/fbctf.yml
insertHints: paid
insertHintUrls: paid
<<<<<<< HEAD
insertHintSnippets: paid`)

    this.timeout(TIMEOUT)
    return expect(execFile('node', [juiceShopCtfCli[0], '--config', configFile, '--output', desiredFbctfOutputFile])
      .then(() => fs.existsSync(desiredFbctfOutputFile))).to
      .eventually.equal(true)
  })

  it('should be possible to create a RootTheBox export with a config file', function () {
    fs.writeFileSync(configFile, `
=======
insertHintSnippets: paid`
      );

      await execFile("node", [
        juiceShopCtfCli,
        "--config",
        configFile,
        "--output",
        desiredFbctfOutputFile,
      ]);
      assert.ok(fs.existsSync(desiredFbctfOutputFile));
    },
    { timeout: TIMEOUT }
  );

  it(
    "should be possible to create a RootTheBox export with a config file",
    async () => {
      fs.writeFileSync(
        configFile,
        `
>>>>>>> 0ea45f0 (needs more fixing)
ctfFramework: RootTheBox
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
insertHints: paid
insertHintUrls: paid
<<<<<<< HEAD
insertHintSnippets: paid`)

    this.timeout(TIMEOUT)
    return expect(execFile('node', [juiceShopCtfCli[0], '--config', configFile, '--output', desiredRtbOutputFile])
      .then(() => fs.existsSync(desiredRtbOutputFile))).to
      .eventually.equal(true)
  })

  it('should fail when output file cannot be written', function () {
    this.timeout(TIMEOUT)
    fs.openSync(outputFile, 'w', 0)
    return expect(run(juiceShopCtfCli, [ENTER, ENTER, ENTER, ENTER, ENTER, ENTER], 2000)).to
      .eventually.match(/Failed to write output to file!/i)
  })
})
=======
insertHintSnippets: paid`
      );

      await execFile("node", [
        juiceShopCtfCli,
        "--config",
        configFile,
        "--output",
        desiredRtbOutputFile,
      ]);
      assert.ok(fs.existsSync(desiredRtbOutputFile));
    },
    { timeout: TIMEOUT }
  );

  it(
    "should fail when output file cannot be written",
    async () => {
      fs.openSync(outputFile, "w", 0);
      const { stdout } = await execFile("node", [
        juiceShopCtfCli,
        "--output",
        outputFile,
      ]);
      assert.match(stdout, /Failed to write output to file!/i);
    },
    { timeout: TIMEOUT }
  );
});
>>>>>>> 0ea45f0 (needs more fixing)
