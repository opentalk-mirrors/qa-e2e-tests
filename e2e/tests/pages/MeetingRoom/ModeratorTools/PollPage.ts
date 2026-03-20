// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

export class PollPage {
  public readonly page: Page;
  public readonly pollHeading: Locator;
  public readonly emptyPollMessage: Locator;
  private readonly createNewPollButton: Locator;
  private readonly pollLists: Locator;

  public readonly createNewPoll: {
    readonly backButton: Locator;
    readonly createPollTitle: Locator;
    readonly liveToggleButton: Locator;
    readonly multipleChoiceToggleButton: Locator;
  };

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.pollHeading = this.page.getByRole('heading', { name: 'Poll' });
    this.emptyPollMessage = this.page.locator('[data-sentry-component="renderPollOverview"]').getByRole('paragraph');
    this.createNewPollButton = this.page.getByRole('button', { name: 'Create new poll' });
    this.createNewPoll = {
      backButton: this.page.getByRole('button', { name: 'back' }),
      createPollTitle: this.page.getByText('Create poll', { exact: true }),
      liveToggleButton: this.page.locator('//input[@name="live"]'),
      multipleChoiceToggleButton: this.page.locator('//input[@name="multipleChoice"]'),
    };
    this.pollLists = this.page.getByRole('list').locator('li');
  }

  public async createNewPollRoom(): Promise<void> {
    await this.createNewPollButton.click();
    await this.createNewPoll.createPollTitle.waitFor({ state: 'visible' });
  }

  public async exitPollRoomCreation(): Promise<void> {
    await this.createNewPoll.backButton.click();
  }

  public async getPollDefaults(): Promise<{ isLive: boolean; allowMultipleChoice: boolean }> {
    return {
      isLive: await this.createNewPoll.liveToggleButton.isChecked(),
      allowMultipleChoice: await this.createNewPoll.multipleChoiceToggleButton.isChecked(),
    };
  }

  public async getExistingPolls(): Promise<number> {
    return this.pollLists.count();
  }
}
