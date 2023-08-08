import type { BrowserContext, Page } from '@playwright/test';

import { FUEL_MNEMONIC, FUEL_WALLET_PASSWORD } from '../mocks';

import { getButtonByText } from './button';

export async function walletSetup(
  context: BrowserContext,
  fuelExtensionId: string,
  page: Page
) {
  await page.goto(`chrome-extension://${fuelExtensionId}/popup.html`);

  const signupPage = await context.waitForEvent('page', {
    predicate: (page) => page.url().includes('sign-up'),
  });
  expect(signupPage.url()).toContain('sign-up');

  const button = signupPage.locator('h3').getByText('Import seed phrase');
  await button.click();

  // Agree to T&S
  await signupPage.getByRole('checkbox').click();
  const toSeedPhrase = getButtonByText(signupPage, 'Next: Seed Phrase');
  await toSeedPhrase.click();

  // Copy and paste seed phrase
  /** Copy words to clipboard area */
  await signupPage.evaluate(
    `navigator.clipboard.writeText('${FUEL_MNEMONIC}')`
  );
  const pasteButton = signupPage.locator('button').getByText('Paste');
  await pasteButton.click();
  const toPassword = signupPage
    .locator('button')
    .getByText('Next: Your password');
  await toPassword.click();

  // Enter password
  const enterPassword = signupPage.locator(`[aria-label="Your Password"]`);
  await enterPassword.type(FUEL_WALLET_PASSWORD);
  // Confirm password
  const confirmPassword = signupPage.locator(`[aria-label="Confirm Password"]`);
  await confirmPassword.type(FUEL_WALLET_PASSWORD);
  const toFinish = getButtonByText(signupPage, 'Next: Finish set-up');
  await toFinish.click();

  await signupPage
    .locator('h2')
    .getByText('Wallet created successfully')
    .waitFor({ state: 'visible', timeout: 9000 });

  await signupPage.goto(
    `chrome-extension://${fuelExtensionId}/popup.html#/wallet`
  );

  // Navigate to add network and add test network
  await signupPage.locator('[aria-label="Selected Network"]').click();
  await signupPage.locator('button').getByText('Add new network').click();
  await signupPage
    .locator('[aria-label="Network URL"]')
    .fill(
      process.env.VITE_FUEL_PROVIDER_URL || 'http://localhost:4000/graphql'
    );
  const addButton = getButtonByText(signupPage, 'Add');
  await addButton.click({ timeout: 9000 });
}

export async function walletConnect(context: BrowserContext) {
  const walletPage = await getWalletPage(context);

  const nextButton = getButtonByText(walletPage, 'Next');
  await nextButton.click();
  const connectButton = getButtonByText(walletPage, 'Connect');
  await connectButton.click();
}

export async function walletApprove(context: BrowserContext) {
  const walletPage = await getWalletPage(context);

  const approveButton = walletPage.locator('button').getByText('Approve');
  await approveButton.click();
}

async function getWalletPage(context: BrowserContext) {
  let walletPage = context.pages().find((p) => p.url().includes('/popup?'));
  if (!walletPage) {
    walletPage = await context.waitForEvent('page', {
      predicate: (page) => page.url().includes('/popup'),
    });
  }

  return walletPage;
}