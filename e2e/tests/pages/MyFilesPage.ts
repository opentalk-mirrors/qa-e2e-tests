// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Download, Locator, Page } from '@playwright/test';
import * as fs from 'fs';

export class MyFilesPage {
  private readonly page: Page;
  private readonly filesTable: Locator;
  private readonly rowLocator: Locator;
  private readonly cellLocator: Locator;
  public readonly filenameColumn: Locator;
  public readonly createdColumn: Locator;
  public readonly sizeColumn: Locator;
  public readonly actionsColumn: Locator;
  private readonly downloadButton: Locator;
  private readonly deleteButton: Locator;

  constructor({ page }: { page: Page }) {
    this.page = page;
    this.filesTable = this.page.getByText('OpenTalk LogoStorage').getByRole('table');
    this.rowLocator = this.page.getByRole('row');
    this.cellLocator = this.page.getByRole('cell');
    this.filenameColumn = this.page.getByRole('columnheader', { name: 'Filename' });
    this.createdColumn = this.page.getByRole('columnheader', { name: 'Created' });
    this.sizeColumn = this.page.getByRole('columnheader', { name: 'Size' });
    this.actionsColumn = this.page.getByRole('columnheader', { name: 'Actions' });
    this.downloadButton = this.page.getByRole('button', { name: 'Download' });
    this.deleteButton = this.page.getByRole('button', { name: 'Delete' });
  }

  private getFileCell(index: number, cellIndex: number): Locator {
    // index+1 because first row is occupied by respective column headers
    return this.rowLocator
      .nth(index + 1)
      .locator(this.cellLocator)
      .nth(cellIndex);
  }

  public async getFileName(index: number): Promise<string> {
    return await this.getFileCell(index, 0).innerText();
  }

  public async getFileCreated(index: number): Promise<string> {
    return await this.getFileCell(index, 1).innerText();
  }

  public async getFileSize(index: number): Promise<string> {
    return await this.getFileCell(index, 2).innerText();
  }

  public getDownloadButtonLocator(index: number): Locator {
    return this.downloadButton.nth(index);
  }

  public getDeleteButtonLocator(index: number): Locator {
    return this.deleteButton.nth(index);
  }

  public async scrollFiles() {
    await this.filesTable.scrollIntoViewIfNeeded();
  }

  public async downloadFile(index: number): Promise<Download> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.getDownloadButtonLocator(index).click(),
    ]);
    return download;
  }

  public async getContentOfFileAsText(downloadedFile: Download): Promise<string> {
    const path = await downloadedFile.path();
    const dataBuffer = fs.readFileSync(path);
    return dataBuffer.toString();
  }

  public async isFilePresent(filename: string): Promise<boolean> {
    const isFilePresent = this.page.getByRole('cell', { name: filename, exact: true });
    return (await isFilePresent.count()) > 0;
  }

  public async deleteFile(filename: string) {
    await this.rowLocator.filter({ hasText: filename }).locator(this.deleteButton).click();
    // Wait for the file's row to disappear
    await this.page.getByRole('cell', { name: filename, exact: true }).waitFor({ state: 'detached' });
  }
}
