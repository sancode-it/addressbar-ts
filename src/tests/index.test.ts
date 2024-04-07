import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { Browser, Builder, By, WebDriver } from 'selenium-webdriver'
import { Options } from 'selenium-webdriver/chrome'

const baseUrl = 'http://localhost:3001/'
const preventUrl = baseUrl + 'preventdefault/'
const setUrl = baseUrl + 'set/'
const popstateUrl = baseUrl + 'popstate/'
const hashUrl = baseUrl + 'hash/'
const trailingUrl = baseUrl + 'trailing/'
const uichange = baseUrl + 'uichange/'
const replace = baseUrl + 'replace/'
const uri = baseUrl + 'uri/'

describe('addressbar', () => {
  const options: Options = new Options()
  let driver: WebDriver
  let url: string
  let text: string

  beforeEach(async () => {
    driver = await new Builder()
      .forBrowser(Browser.CHROME)
      .setChromeOptions(options.addArguments('headless=new'))
      .build()
  })

  afterEach(async () => {
    await driver.quit()
  })

  test('should display current url', async () => {
    await driver.get(preventUrl)
    url = await driver.getCurrentUrl()
    expect(url).toBe(preventUrl)
  })

  test('should not allow going to a new url', async () => {
    await driver.get(preventUrl)
    await driver.navigate().to(preventUrl + '#/foo')
    url = await driver.getCurrentUrl()
    expect(url).toBe(preventUrl)
  })

  test('should set url manually when prevented', async () => {
    await driver.get(setUrl)
    await driver.navigate().to(setUrl + '#/foo')
    url = await driver.getCurrentUrl()
    expect(url).toBe(setUrl + '#/foo')
  })

  test('should go to popstate url', async () => {
    await driver.get(popstateUrl)

    await driver.findElement(By.id('messages')).click()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + 'messages')

    await driver.findElement(By.id('message')).click()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + 'messages/123')
  })

  test('should handle back and forward with popstate', async () => {
    await driver.get(popstateUrl)

    await driver.findElement(By.id('messages')).click()
    await driver.findElement(By.id('message')).click()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + 'messages/123')

    await driver.navigate().back()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + 'messages')

    await driver.navigate().forward()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + 'messages/123')
  })

  test('should go to hash url', async () => {
    await driver.get(hashUrl)

    await driver.findElement(By.id('messages')).click()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + '#/messages')

    await driver.findElement(By.id('message')).click()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + '#/messages/123')
  })

  test('should handle back and forward with hash', async () => {
    await driver.get(hashUrl)
    await driver.findElement(By.id('messages')).click()
    await driver.findElement(By.id('message')).click()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + '#/messages/123')

    await driver.navigate().back()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + '#/messages')

    await driver.navigate().forward()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + '#/messages/123')
  })

  test('should handle trailing slash convertion', async () => {
    await driver.get(trailingUrl + '#/messages/123')
    await driver.navigate().to(trailingUrl + '#/messages/')
    url = await driver.getCurrentUrl()
    expect(url).toBe(trailingUrl + '#/messages')

    await driver.navigate().back()
    url = await driver.getCurrentUrl()
    expect(url).toBe(trailingUrl + '#/messages/123')

    await driver.navigate().forward()
    url = await driver.getCurrentUrl()
    expect(url).toBe(trailingUrl + '#/messages')
  })

  test('should resume history when changing url when on "back" url', async () => {
    await driver.get(hashUrl)

    await driver.findElement(By.id('messages')).click()
    await driver.findElement(By.id('message')).click()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + '#/messages/123')

    await driver.navigate().back()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + '#/messages')

    await driver.navigate().to(baseUrl + '#/messages/456')
    await driver.navigate().forward()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + '#/messages/456')
  })

  test('should be able to go forward and backwards twice', async () => {
    await driver.get(uichange)

    await driver.findElement(By.id('messages')).click()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + '#/messages')
    text = await driver.findElement(By.id('url')).getText()
    expect(text).toBe(baseUrl + '#/messages')

    await driver.navigate().back()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + 'uichange/')
    text = await driver.findElement(By.id('url')).getText()
    expect(text).toBe(baseUrl + 'uichange/')

    await driver.findElement(By.id('messages')).click()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + '#/messages')
    text = await driver.findElement(By.id('url')).getText()
    expect(text).toBe(baseUrl + '#/messages')

    await driver.navigate().back()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + 'uichange/')
    text = await driver.findElement(By.id('url')).getText()
    expect(text).toBe(baseUrl + 'uichange/')
  })

  test('should be able to move back and forward with mix of url and setting manually and still use back button', async () => {
    await driver.get(uichange)

    await driver.findElement(By.id('home')).click()
    let url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + '#/')
    let text = await driver.findElement(By.id('url')).getText()
    expect(text).toBe(baseUrl + '#/')

    await driver.findElement(By.id('messages')).click()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + '#/messages')
    text = await driver.findElement(By.id('url')).getText()
    expect(text).toBe(baseUrl + '#/messages')

    await driver.findElement(By.id('home')).click()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + '#/')
    text = await driver.findElement(By.id('url')).getText()
    expect(text).toBe(baseUrl + '#/')

    await driver.findElement(By.id('messages')).click()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + '#/messages')
    text = await driver.findElement(By.id('url')).getText()
    expect(text).toBe(baseUrl + '#/messages')

    await driver.navigate().back()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + '#/')
    text = await driver.findElement(By.id('url')).getText()
    expect(text).toBe(baseUrl + '#/')

    await driver.navigate().back()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + '#/messages')
    text = await driver.findElement(By.id('url')).getText()
    expect(text).toBe(baseUrl + '#/messages')

    await driver.navigate().back()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + '#/')
    text = await driver.findElement(By.id('url')).getText()
    expect(text).toBe(baseUrl + '#/')

    await driver.navigate().back()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + 'uichange/')
    text = await driver.findElement(By.id('url')).getText()
    expect(text).toBe(baseUrl + 'uichange/')
  })

  test('should be able to replace the set url', async () => {
    await driver.get(replace)

    await driver.findElement(By.id('home')).click()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + '#/home')

    await driver.findElement(By.id('messagesReplace')).click()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + '#/messages')

    await driver.navigate().back()
    url = await driver.getCurrentUrl()
    expect(url).toBe('http://localhost:3001/replace/')
    text = await driver.findElement(By.id('url')).getText()
    expect(text).toBe('http://localhost:3001/replace/')

    await driver.findElement(By.id('home')).click()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + '#/home')

    await driver.findElement(By.id('messages')).click()
    url = await driver.getCurrentUrl()
    expect(url).toBe(baseUrl + '#/messages')

    await driver.navigate().back()
    url = await driver.getCurrentUrl()
    expect(url).toBe('http://localhost:3001/#/home')
    text = await driver.findElement(By.id('url')).getText()
    expect(text).toBe('http://localhost:3001/#/home')
  })

  test('should expose origin, protocol, port and hostname as properties', async () => {
    await driver.get(uri)

    url = await driver.getCurrentUrl()
    expect(url).toBe('http://localhost:3001/uri/')
    text = await driver.findElement(By.id('origin')).getText()
    expect(text).toBe('http://localhost:3001')
    text = await driver.findElement(By.id('protocol')).getText()
    expect(text).toBe('http:')
    text = await driver.findElement(By.id('port')).getText()
    expect(text).toBe('3001')
    text = await driver.findElement(By.id('hostname')).getText()
    expect(text).toBe('localhost')
    text = await driver.findElement(By.id('pathname')).getText()
    expect(text).toBe('/uri/')
    text = await driver.findElement(By.id('hash')).getText()
    expect(text).toBe('')

    await driver.findElement(By.id('messages')).click()
    text = await driver.findElement(By.id('pathname')).getText()
    expect(text).toBe('/')
    text = await driver.findElement(By.id('hash')).getText()
    expect(text).toBe('#/messages')
  })
})
