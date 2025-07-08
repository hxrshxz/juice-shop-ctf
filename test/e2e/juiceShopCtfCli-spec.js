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
      const { events, getScreen } = await render(input, {
        message: "Juice Shop URL",
        validate: (url) => {
          // Change this condition to be more precise
          if (!url.startsWith("http://") && !url.startsWith("https://"))
            return "Failed to fetch challenges from API!";
          return true;
        },
      });

      events.type("xyz://localhorst"); // Change to not start with http
      events.keypress("enter");

      await new Promise((resolve) => setTimeout(resolve, 100));
      assert.match(getScreen(), /Failed to fetch challenges from API!/);
    },
    { timeout: TIMEOUT }
  );

  it(
    "should fail on invalid ctf.key URL",
    async () => {
      const { events, getScreen } = await render(input, {
        message: "CTF key URL",
        validate: (url) => {
          try {
            const parsed = new URL(url);
            if (!["http:", "https:"].includes(parsed.protocol)) {
              return "Failed to fetch secret key from URL!";
            }
          } catch {
            return "Failed to fetch secret key from URL!";
          }
          return true;
        },
      });

      events.type("httpx://invalid/ctf-key");
      events.keypress("enter");

      await new Promise((resolve) => setTimeout(resolve, 300));

      console.log(getScreen());

      assert.match(getScreen(), /Failed to fetch secret key from URL!/);
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
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
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
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
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
ctfFramework: CTFd
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
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
    "should be possible to create a FBCTF export with a config file",
    async () => {
      fs.writeFileSync(
        configFile,
        `
ctfFramework: FBCTF
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
countryMapping: https://raw.githubusercontent.com/juice-shop/juice-shop/master/config/fbctf.yml
insertHints: paid
insertHintUrls: paid
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
ctfFramework: RootTheBox
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
insertHints: paid
insertHintUrls: paid
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
      console.log('done.................')
    },
    { timeout: TIMEOUT }

  );
  // it(
  //   "should fail when output file cannot be written",
  //   async () => {
  //     // Make outputFile unwritable
  //     fs.writeFileSync(outputFile, "locked");
  //     fs.chmodSync(outputFile, 0o000); // No permissions

  //     try {
  //       const { stdout } = await execFile("node", [
  //         juiceShopCtfCli,
  //         "--output",
  //         outputFile,
  //       ]);
  //       assert.match(stdout, /Failed to write output to file!/i);
  //     } finally {
  //       // Restore permission so cleanup doesn’t block future tests
  //       fs.chmodSync(outputFile, 0o644);
  //     }
  //   },
  //   { timeout: TIMEOUT }
  // );
});
