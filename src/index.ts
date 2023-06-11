/*
 * @Author: wangshicheng
 * @Date: 2021-09-11 13:21:35
 * @Description: 处理浏览器window.open非用户操作被安全策略拦截问题
 * @FilePath: /window-open/src/index.ts
 */

export interface IWindowOpen {
  duration?: number
  apiPromise: () => Promise<string>
  errorCallback?: () => void
  getErrorMsg?: (err: unknown) => string

  isClose?: boolean
  errorStyle?: string
  loadingStyle?: string
}

const getErr = (err: unknown) => {
  if (typeof err === 'string') {
    return err
  }
  if (typeof err === 'object') {
    return JSON.stringify(err, Object.getOwnPropertyNames(err))
  }
  return '存在异常'
}

const errorMsgCoponent = (params: { msg: string; duration: number; errorStyle?: string }) => {
  const { msg, duration = 3, errorStyle } = params || {}
  return `
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
            <span>${msg || '异常错误消息'}</span>
            <span id="window-open-error-msg">, ${duration}s之后关闭</span>
          </div>
        </div>
      </div>
  </div>
  `
}

export const windowOpen: (params: IWindowOpen) => WindowProxy | null = params => {
  const {
    apiPromise,
    errorCallback,
    getErrorMsg = getErr,

    isClose = true,
    duration = 3,
    loadingStyle,
    errorStyle
  } = params || {}
  let win: Window | null = null
  const originHref = location.href

  win = window.open('about:blank') // 打开一个空Tab页
  if (!win) return win

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

  apiPromise()
    ?.then(resUrl => {
      if (!win) return

      win.location.href = resUrl
    })
    ?.catch(err => {
      const msg = getErrorMsg?.(err)

      if (!win) return
      win.document.body.innerHTML = errorMsgCoponent({ msg, duration, errorStyle })

      setTimeout(() => {
        if (!win) return

        if (isClose) {
          win.close()
        } else {
          win.location.href = originHref
        }
      }, duration * 1000)

      errorCallback?.()
    })

  return win
}
