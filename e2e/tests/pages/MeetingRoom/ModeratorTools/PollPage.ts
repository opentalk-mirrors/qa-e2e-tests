// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locator, Page } from '@playwright/test';

export class PollPage {
  public readonly page: Page;
  public readonly pollHeading: Locator;
  public readonly emptyPollMessage: Locator;
  private readonly createNewPollButton: Locator;
  private readonly removeIcon: Locator;
  private readonly documentBody: Locator;
  private readonly pollLists: Locator;

  public readonly createNewPoll: {
    readonly backButton: Locator;
    readonly createPollTitle: Locator;
    readonly liveToggleButton: Locator;
    readonly multipleChoiceToggleButton: Locator;
    readonly topicField: Locator;
    readonly firstOptionButton: Locator;
    readonly secondOptionButton: Locator;
    readonly addOptionButton: Locator;
    readonly optionButtons: Locator;
    readonly savePollAsTemplateButton: Locator;
  };

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.pollHeading = this.page.getByRole('heading', { name: 'Poll' });
    this.emptyPollMessage = this.page.getByRole('tabpanel', { name: 'Poll' }).getByRole('paragraph');
    this.createNewPollButton = this.page.getByRole('button', { name: 'Create new poll' });
    this.createNewPoll = {
      backButton: this.page.getByRole('button', { name: 'back' }),
      createPollTitle: this.page.getByText('Create poll', { exact: true }),
      liveToggleButton: this.page.locator('//input[@name="live"]'),
      multipleChoiceToggleButton: this.page.locator('//input[@name="multipleChoice"]'),
      topicField: this.page.getByRole('textbox', { name: 'Topic', exact: true }),
      firstOptionButton: this.page.getByRole('button', { name: 'Add Option 1', exact: true }),
      secondOptionButton: this.page.getByRole('button', { name: 'Add Option 2', exact: true }),
      addOptionButton: this.page.getByRole('button', { name: 'Add Option', exact: true }),
      optionButtons: this.page.locator('.MuiChip-filledDefault'),
      savePollAsTemplateButton: this.page.getByRole('button', { name: 'Save As Template', exact: true }),
    };
    this.removeIcon = this.page.locator('.MuiChip-deleteIconFilledColorDefault');
    this.documentBody = this.page.locator('body');
    this.pollLists = this.page.getByRole('list').getByRole('button');
  }

  public async createNewPollRoom(): Promise<void> {
    await this.createNewPollButton.click();
    await this.createNewPoll.createPollTitle.waitFor({ state: 'visible' });
  }

  public async exitPollRoomCreation(): Promise<void> {
    await this.createNewPoll.backButton.click();
  }

  public async getCurrentSettings(): Promise<{ isLive: boolean; allowMultipleChoice: boolean }> {
    return {
      isLive: await this.createNewPoll.liveToggleButton.isChecked(),
      allowMultipleChoice: await this.createNewPoll.multipleChoiceToggleButton.isChecked(),
    };
  }

  public async getExistingPolls(): Promise<number> {
    return this.pollLists.count();
  }

  public async enterTopicValue(value: string): Promise<void> {
    await this.createNewPoll.topicField.fill(value);
  }

  public async addOption(): Promise<void> {
    await this.createNewPoll.addOptionButton.click();
  }

  public async fillAnswer(answer: string): Promise<void> {
    await this.page.keyboard.type(answer);
  }

  public getOptionIndex(field: string): number {
    return parseInt(field.match(/\d+/)?.[0] || '0') - 1;
  }

  public async fillOption(index: number, value: string): Promise<void> {
    const defaultOptionCount = 2;

    if (index < defaultOptionCount) {
      await this.fillDefaultOptionsByIndex(index, value);
    } else {
      await this.fillAdditionalOptions([value]);
    }
  }

  async fillDefaultOptionsByIndex(optionIndex: number, answer: string): Promise<void> {
    const optionButtons = [this.createNewPoll.firstOptionButton, this.createNewPoll.secondOptionButton];

    if (optionIndex < optionButtons.length) {
      const option = optionButtons[optionIndex];

      await option.click();
      await this.fillAnswer(answer);
    }
  }

  public async fillAdditionalOptions(options: string[]): Promise<void> {
    for (const answer of options) {
      await this.addOption();
      await this.fillAnswer(answer);
    }
    await this.documentBody.click();
  }

  public async updateOption(index: number, value: string): Promise<void> {
    const defaultOptionCount = 2;
    if (index < defaultOptionCount) {
      await this.fillDefaultOptionsByIndex(index, value);
      return;
    }
    const additionalOptions = this.createNewPoll.optionButtons;
    const existingAdditionalCount = await additionalOptions.count();
    if (index < existingAdditionalCount) {
      await this.updateExistingAdditionalOptions(index, value);
    } else {
      await this.fillAdditionalOptions([value]);
    }
  }

  public async updateExistingAdditionalOptions(index: number, value: string): Promise<void> {
    const option = this.getOptionByIndex(index);
    await this.clearAndFocusField(option);
    await this.fillAnswer(value);
    await this.page.keyboard.press('Enter');
  }

  async clearAndFocusField(option: Locator): Promise<void> {
    await option.click();
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.press('Backspace');
  }

  /**
   * Removes a poll option from the end of the list.
   *
   * positionFromEnd defines which option to remove:
   * 0 → last option
   * 1 → second-last option
   * 2 → third-last option
   *
   * Example:
   * [Option1, Option2, Option3, Option4]
   * positionFromEnd = 1 → removes Option3
   */
  public async removeOptionFromEnd(positionFromEnd: number): Promise<void> {
    const count = await this.removeIcon.count();
    if (count <= positionFromEnd) {
      throw new Error(`Cannot remove option: only ${count} options available`);
    }
    await this.removeIcon.nth(count - 1 - positionFromEnd).click();
  }

  public async saveAsTemplate(): Promise<void> {
    await this.createNewPoll.savePollAsTemplateButton.click();
  }

  public async selectLatestPoll(): Promise<void> {
    const latestPoll = this.pollLists.last();
    await latestPoll.click();
  }

  public getOptionByIndex(index: number): Locator {
    return this.createNewPoll.optionButtons.nth(index);
  }
}
