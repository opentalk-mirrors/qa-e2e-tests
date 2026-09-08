// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Page, Locator } from '@playwright/test';

export class MeetingDetailsPage {
  public readonly page: Page;
  private readonly meetingLinkInput: Locator;
  private readonly copyMeetingLinkButton: Locator;
  private readonly finishedCopyButtonText: string;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.meetingLinkInput = this.page.getByLabel('Meeting-Link');
    this.copyMeetingLinkButton = this.page.getByRole('button', { name: new RegExp('Copy Room link for .+') });
    this.finishedCopyButtonText = 'Copied';
  }

  async getMeetingLink(): Promise<string> {
    await this.meetingLinkInput.waitFor({ state: 'visible' });
    await this.waitForTypeOfInputToBeText(this.meetingLinkInput);
    return this.meetingLinkInput.inputValue();
  }

  private async waitForTypeOfInputToBeText(locator: Locator): Promise<void> {
    // when the page is loaded the type of the field is wrong for a while
    // it only becomes an input field after a while
    let type: string;
    do {
      type = (await locator.getAttribute('type')) ?? '';
    } while (type !== 'text');
  }

  async copyMeetingLinkToClipboard() {
    await this.copyMeetingLinkButton.click();
    await this.copyMeetingLinkButton.getByText(this.finishedCopyButtonText).waitFor();
  }
}
