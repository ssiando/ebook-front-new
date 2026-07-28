import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } })
const errors = []
page.on('pageerror', (err) => errors.push(String(err)))
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })

// 1) Role create modal: submit empty -> required error + asterisk + toast
await page.goto('http://localhost:5241/roleManagement', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: '등록' }).click()
await page.waitForTimeout(200)
await page.screenshot({ path: 'C:/AI/ebook/_f1_role_modal_empty.png' })

const dialog = page.locator('.fixed.inset-0')
await dialog.getByRole('button', { name: '저장' }).click()
await page.waitForTimeout(300)
await page.screenshot({ path: 'C:/AI/ebook/_f2_role_modal_error_and_toast.png' })

// 2) maxLength test: type a very long roleName (>30 chars) then submit
await dialog.getByLabel('역할명').fill('가'.repeat(35))
await dialog.getByRole('button', { name: '저장' }).click()
await page.waitForTimeout(300)
await page.screenshot({ path: 'C:/AI/ebook/_f3_role_modal_maxlength_error.png' })

// 3) fix and save successfully
await dialog.getByLabel('역할명').fill('테스트역할')
await dialog.getByRole('button', { name: '저장' }).click()
await page.waitForTimeout(600)
await page.screenshot({ path: 'C:/AI/ebook/_f4_role_saved.png' })

console.log('ERRORS:', JSON.stringify(errors))
await browser.close()
