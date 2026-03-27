const { chromium } = require('playwright');
const assert = require('assert');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log("Navigating to local dev server...");
  await page.goto('http://localhost:3000');

  // Start chat by clicking the button that triggers onStart
  console.log("Starting chat...");
  await page.click('button.bg-\\[\\#5B50FF\\]');

  // Wait for the chat to load
  const inputSelector = 'input[placeholder="What do you want to learn today?"]';
  await page.waitForSelector(inputSelector);

  // Send a message that triggers the editor update
  console.log("Sending trigger message...");
  await page.fill(inputSelector, 'write some python code');
  await page.keyboard.press('Enter');

  // Wait for AI response
  await page.waitForSelector('text=Here is some Python code I wrote for you.');

  console.log("Response received. Checking if Code Editor opened and updated...");
  // Wait for editor to become visible and have the new text
  await page.waitForSelector('.monaco-editor');

  // Wait for the specific text to appear in the DOM
  await page.waitForSelector('text=hello_playwright');

  const editorContent = await page.evaluate(() => {
    return document.querySelector('.monaco-editor').innerText;
  });

  assert(editorContent.includes('hello_playwright'), 'Code editor did not receive the correct code snippet from the AI agent.');

  console.log("Playwright test passed: AI agent successfully updated the code editor.");

  await browser.close();
  process.exit(0);
})();
