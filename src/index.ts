/*
 * @Author: wangshicheng
 * @Date: 2021-09-11 13:21:35
 * @Description: 处理浏览器window.open非用户操作被安全策略拦截问题
 * @FilePath: /window-open-pro/src/index.ts
 */

export interface IWindowOpen {
  /** 异步操作异常之后，是关闭loading页，还是设置为发起页 */
  isClose?: boolean;
  /** 设置异常提示的展示时间 */
  duration?: number;
  /** 设置window.open的最大阻塞时间， chrome测试：5s之内都不会被阻塞 */
  maxBlockTime?: number;
  /** 异步操作发生异常之后跳转的页面，url上会自动拼接： ?errMsg=xxxx, 由业务方自定处理 */
  errorPageUrl?: string;
  /** 自定义 loading 页面 */
  loadingPageUrl?: string;

  /** 异常消息的样式 */
  errorStyle?: string;
  /** loading 文档的样式 */
  loadingStyle?: string;

  /** 异步方法，返回的是目标页面URL */
  apiPromise: () => Promise<string>;
  /** 异步方法执行失败之后的回调 */
  errorCallback?: (err: unknown) => void;
  /** 提取异常提示信息 */
  getErrorMsg?: (err: unknown) => string;
}

export const getErr = (err: unknown) => {
  if (typeof err === 'string') {
    return err;
  }
  if (typeof err === 'object') {
    return JSON.stringify(err, Object.getOwnPropertyNames(err));
  }
  return '存在异常';
};

const showErrorMsg = (params: {
  msg: string;
  duration: number;
  errorStyle?: string;
  win: Window | null;
  errorPageUrl?: string;
}) => {
  const { msg, errorStyle, win, errorPageUrl } = params || {};
  let { duration = 3 } = params || {};

  if (!win) {
    return;
  }

  if (errorPageUrl) {
    win.location.href = `${errorPageUrl}?errMsg=${msg}`;
    return;
  }

  const timer = setInterval(function () {
    if (duration > 0) {
      duration--;
      if (!win) {
        return;
      }
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
      `;
    } else {
      clearInterval(timer);
    }
  }, 1000);
};

export const windowOpen: (
  params: IWindowOpen,
) => Promise<void> = async params => {
  const {
    apiPromise,
    errorCallback,
    getErrorMsg = getErr,

    isClose = true,
    maxBlockTime = 3,
    duration = 3,
    loadingPageUrl,
    errorPageUrl,
    loadingStyle,
    errorStyle,
  } = params || {};
  let win: Window | null = null;
  const originHref = location.href;
  let isOverTime = false;

  const timer = setTimeout(() => {
    isOverTime = true;

    win = window.open('about:blank'); // 打开一个空Tab页
    if (!win) {
      return;
    }

    if (loadingPageUrl) {
      win.location.href = loadingPageUrl;
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
      `;
    }
  }, maxBlockTime * 1000);

  try {
    const resUrl = await apiPromise();
    if (!resUrl) {
      return;
    }

    clearTimeout(timer);

    if (isOverTime) {
      // console.log('接口超过3s了', win);
      if (win) {
        (win as Window).location.href = resUrl;
      } else {
        window.location.href = resUrl;
      }
    } else {
      // console.log('接口很快，没超过3s', win, resUrl);
      window.open(resUrl);
    }
  } catch (err) {
    const msg = getErrorMsg?.(err);
    clearTimeout(timer);

    if (isOverTime) {
      // console.log('接口超过3s了', win);
    } else {
      // console.log('接口很快，没超过3s', win);
      win = window.open('about:blank');
    }

    if (!win) {
      return;
    }
    showErrorMsg({ msg, duration, errorStyle, win, errorPageUrl });

    setTimeout(() => {
      if (!win) {
        return;
      }

      if (isClose) {
        win.close();
      } else {
        win.location.href = originHref;
      }
    }, duration * 1000);

    errorCallback?.(err);
  }
};
