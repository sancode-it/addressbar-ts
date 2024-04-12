import url from 'url-parse'
import { EventEmitter } from 'eventemitter3'

export type { Addressbar }

class Addressbar extends EventEmitter {
  addEventListener = this.addListener
  removeEventListener = this.removeListener
  #value = ''
  origin: string = ''
  protocol: string = ''
  port: string = ''
  hostname: string = ''
  pathname: string = ''
  hash: string = ''

  /*
    Getter and setter are stubs for TypeScript.
    They should be implemented by the instance.
  */
  get value(): string {
    return this.#value
  }

  set value(value: string | { value: string; replace: boolean }) {
    if (typeof value !== 'string') {
      value = value.value
    }

    this.#value = value
  }
}

let instance: Addressbar | null = null

export default (() => {
  if (instance) {
    return instance
  }

  const addressbar = new Addressbar()

  const initialUrl = location.href
  const uri = url(initialUrl)
  const origin = uri.protocol + '//' + uri.host
  let isPreventingDefault = false
  let doReplace = false
  let prevUrl = ''
  let isEmitting = false
  let setSyncUrl = false

  const emitChange = (url?: string, event?: MouseEvent | TouchEvent) => {
    addressbar.emit('change', {
      preventDefault: () => {
        event?.preventDefault()
        isPreventingDefault = true
      },
      target: {
        value: url ? origin + url : location.href,
      },
    })
  }

  const onUrlChange = () => {
    return () => {
      if (location.href === prevUrl) {
        return
      }

      // Fixes bug where trailing slash is converted to normal url
      if (location.href[location.href.length - 1] === '/') {
        doReplace = true
      }

      isEmitting = true
      emitChange()
      isEmitting = false

      if (!setSyncUrl && isPreventingDefault) {
        history.replaceState(
          {},
          '',
          (prevUrl || initialUrl).replace(origin, '')
        )
      }

      prevUrl = location.href
      isPreventingDefault = false
      setSyncUrl = false
      doReplace = false
    }
  }

  // this hack resolves issue with safari
  // see issue from Page JS for reference https://github.com/visionmedia/page.js/issues/213
  // see also https://github.com/visionmedia/page.js/pull/240
  if (document.readyState !== 'complete') {
    // load event has not fired
    addEventListener(
      'load',
      () => {
        setTimeout(() => {
          addEventListener('popstate', onUrlChange(), false)
        }, 0)
      },
      false
    )
  } else {
    // load event has fired
    addEventListener('popstate', onUrlChange(), false)
  }

  Object.defineProperty(addressbar, 'value', {
    get: () => location.href,
    set: (value: string | { value: string; replace: boolean }) => {
      if (typeof value !== 'string') {
        doReplace = Boolean(value.replace)
        value = value.value
      }

      // If emitting a change we flag that we are setting
      // a url based on the event being emitted
      if (isEmitting) {
        setSyncUrl = true
      }

      // Ensure full url
      if (value.indexOf(origin) === -1) {
        value = origin + value
      }

      // If it is same url, forget about it
      if (value === location.href) {
        return
      }

      // We might need to replace the url if we are fixing
      // for example trailing slash issue
      if (doReplace) {
        history.replaceState({}, '', value.replace(origin, ''))
        doReplace = false
      } else {
        history.pushState({}, '', value.replace(origin, ''))
      }

      prevUrl = location.href
      isPreventingDefault = false
    },
  })

  // expose URLUtils like API https://developer.mozilla.org/en-US/docs/Web/API/URL
  // thanks https://github.com/cofounders/urlutils for reference
  Object.defineProperty(addressbar, 'origin', {
    get: () => {
      const uri = url(location.href)
      return uri.protocol + '//' + uri.host
    },
  })

  Object.defineProperty(addressbar, 'protocol', {
    get: () => url(location.href).protocol,
  })

  Object.defineProperty(addressbar, 'port', {
    get: () => url(location.href).port,
  })

  Object.defineProperty(addressbar, 'hostname', {
    get: () => url(location.href).hostname,
  })

  Object.defineProperty(addressbar, 'pathname', {
    get: () => url(location.href).pathname,
  })

  Object.defineProperty(addressbar, 'hash', {
    get: () => url(location.href).hash,
  })

  /*
    This code is from the Page JS source code. Amazing work on handling all
    kinds of scenarios with hyperlinks, thanks!
  */

  const isSameOrigin = (href: string) => href?.indexOf(origin) === 0

  const getClickedHref = (event: MouseEvent | TouchEvent) => {
    // check which button
    if (event instanceof MouseEvent && event.button !== 0) {
      return false
    }

    // check for modifiers
    if (event.metaKey || event.ctrlKey || event.shiftKey) {
      return false
    }
    if (event.defaultPrevented) {
      return false
    }

    // check if target is HTML element
    if (!(event.target instanceof HTMLElement)) {
      return false
    }

    // ensure link
    let element = event.target
    while (element?.nodeName !== 'A') {
      element = element.parentNode as HTMLElement
    }
    if (!element || element.nodeName !== 'A') {
      return false
    }

    const anchorElement: HTMLAnchorElement = element as HTMLAnchorElement

    // Ignore if tag has
    // 1. "download" attribute
    // 2. rel="external" attribute
    if (
      anchorElement.hasAttribute('download') ||
      anchorElement.getAttribute('rel') === 'external'
    ) {
      return false
    }

    // Check for mailto: in the href
    const href = anchorElement.getAttribute('href')
    if (href && href.indexOf('mailto:') > -1) {
      return false
    }

    // check target
    if (anchorElement.hasAttribute('target')) {
      return false
    }

    // x-origin
    if (!isSameOrigin(anchorElement.href)) {
      return false
    }

    return href
  }

  addEventListener(document.ontouchstart ? 'touchstart' : 'click', (event) => {
    const href = getClickedHref(event)
    if (href) {
      isEmitting = true
      emitChange(href, event)
      isEmitting = false
      prevUrl = href
      isPreventingDefault = false
    }
  })

  instance = addressbar

  return addressbar
})()
