// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Before, After } from '@cucumber/cucumber';
import { Browser, BrowserType, chromium, firefox, webkit } from '@playwright/test';

import { config } from '../config';
import { CustomWorld } from './cucumberWorld';

let browser: Browser;

Before(async function (this: CustomWorld, scenario) {
  this.testId = scenario.pickle.id;
  const browserName = config.browser;
  let browserType: BrowserType<Browser>;
  let args = [
    '--use-fake-device-for-media-stream',
    '--use-fake-ui-for-media-stream',
    '--allow-file-access',
    '--guest',
    '--disable-web-security',
    '--allow-running-insecure-content',
  ];
  let firefoxUserPrefs: { [key: string]: string | number | boolean } = {
    'permissions.default.microphone': 1,
    'permissions.default.camera': 1,
    'media.navigator.streams.fake': true,
    'media.navigator.permission.disabled': true,
    'dom.events.testing.asyncClipboard': true,
    'dom.events.asyncClipboard.readText': true,
    'dom.events.asyncClipboard.clipboardItem': true,
    'dom.events.asyncClipboard.writeText': true,
    'permissions.default.clipboard-read': 1,
    'permissions.default.clipboard-write': true,
  };

  switch (browserName) {
    case 'firefox':
      browserType = firefox;
      break;
    case 'webkit':
      browserType = webkit;
      args = [];
      firefoxUserPrefs = {};
      break;
    default:
      browserType = chromium;
  }

  browser = await browserType.launch({
    slowMo: config.slowMo,
    headless: config.headless,
    args: args,
    firefoxUserPrefs: firefoxUserPrefs,
  });
  this.setBrowser(browser);
});

After(async function (this: CustomWorld, scenario) {
  await this.cleanup(scenario);
  await browser.close();
});
