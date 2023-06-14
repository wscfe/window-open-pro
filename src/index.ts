/*
 * @Author: wangshicheng
 * @Date: 2021-09-11 13:21:35
 * @Description: 处理浏览器window.open非用户操作被安全策略拦截问题
 * @FilePath: /window-open-pro/src/index.ts
 */

export interface IWindowOpen {
  isClose?: boolean
  duration?: number
  errorPageUrl?: string
  loadingPageUrl?: string

  errorStyle?: string
  loadingStyle?: string

  apiPromise: () => Promise<string>
  errorCallback?: (err: unknown) => void
  getErrorMsg?: (err: unknown) => string
}

export const getErr = (err: unknown) => {
  if (typeof err === 'string') {
    return err
  }
  if (typeof err === 'object') {
    return JSON.stringify(err, Object.getOwnPropertyNames(err))
  }
  return '存在异常'
}

const showErrorMsg = (params: {
  msg: string
  duration: number
  errorStyle?: string
  win: Window | null
  errorPageUrl?: string
}) => {
  let { msg, duration = 3, errorStyle, win, errorPageUrl } = params || {}

  if (!win) return

  if (errorPageUrl) {
    win.location.href = `${errorPageUrl}?errMsg=${msg}`
    return
  }

  const timer = setInterval(function() {
    if (duration > 0) {
      duration--
      if (!win) return
      win.document.body.innerHTML = `
        <div style="margin-top: 8px; color: #232323; ${errorStyle}">
          <div
            style="padding: 8px;
            text-align: center;"
          >
            <div
              style="display: inline-block;
              padding: 9px 12px;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
              pointer-events: all;"
            >
              <div>
                <span>${msg || '存在异常'}</span>
                <span id="window-open-error-msg">, ${duration}秒跳转页面</span>
              </div>
            </div>
          </div>
      </div>
      `
    } else {
      clearInterval(timer)
    }
  }, 1000)
}

const delay = (gap: number) => {
  var then, now
  then = new Date().getTime()
  now = then
  while (now - then < gap) {
    now = new Date().getTime()
  }
}

export const windowOpen: (params: IWindowOpen) => WindowProxy | null = params => {
  const {
    apiPromise,
    errorCallback,
    getErrorMsg = getErr,

    isClose = true,
    duration = 3,
    loadingPageUrl,
    errorPageUrl,
    loadingStyle,
    errorStyle
  } = params || {}
  let win: Window | null = null
  const originHref = location.href

  apiPromise()
    ?.then(resUrl => {
      if (!win) return
      win.location.href = resUrl
    })
    ?.catch(err => {
      const msg = getErrorMsg?.(err)

      if (!win) return
      showErrorMsg({ msg, duration, errorStyle, win, errorPageUrl })

      setTimeout(() => {
        if (!win) return

        if (isClose) {
          win.close()
        } else {
          win.location.href = originHref
        }
      }, duration * 1000)

      errorCallback?.(err)
    })

  delay(3000)
  win = window.open('about:blank') // 打开一个空Tab页
  if (!win) return win

  if (loadingPageUrl) {
    win.location.href = loadingPageUrl
  } else {
    win.document.body.innerHTML = `
    <div style="margin-top: 8px; color: #232323; ${loadingStyle}">
      <div style="padding: 8px;
      text-align: center;">
        <div
          style="display: inline-block;
          padding: 9px 12px;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
          pointer-events: all;"
        >
          页面加载中, 请稍后...
      </div>
    </div>
  `
  }

  return win
}
