> > window.open 部分场景被拦截问题处理方案

### 背景

当浏览器检测到非用户操作产生的新弹出窗口，则会对其进行阻止。因为浏览器认为这可能是一个广告，不是一个用户希望看到的页面；

### 拦截场景：

1. 异步场景：window.open 在异步代码内部执行
2. 同步场景：由脚本自动执行 window.open【非用户触发】

### 目标

1. 解决异步场景下 window.open 可以正常跳转，提升用户体验

### 解决思路

1. 异步方法执行之前打开一个新的 Tag 页，内部包含 loading 提示（提升用户体验）
2. 执行异步方法
3. 异步方法成功之后，返回一个目标页面的 url，替换新的 Tab 页 url，渲染目标页
4. 异步方法失败之后，loading 提示更换为「异常信息提示」，让用户感知为什么失败
5. 支持自动 关闭新的 loading tab 页
6. 支持自动跳转回发起页

### 使用姿势

1. 安装

```bash
yarn add window-open-pro
```

2. windowOpen 参数 TS 类型定义

```ts
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
```

伪代码

```ts
import React from 'react';
import { windowOpen } from '@coobee/window-open-pro';

const Appp = () => {
   
    const handleSubmit = () => {
        windowOpen({
          // 异步请求失败，自动关闭loading 新tab页
          isClose: true,
          
          // 1. 异步方法没有参数写法
          // apiPromise: asyncApiPromise
          
          // 2. 异步方法存在参数
          apiPromise: async () => await asyncApiPromise()
        });
    };
    
    // 异步请求方法封装，注意方法需要返回目标URL
    const asyncApiPromise = () => {
        return new Promise((resolve, reject) => {
            try {
                const resData = await fetchApi(apis, {});
                resolve(utils.formatUrl(`/deposit/share/detail/${resData?.id}`));      
            } catch(err){
                reject(err.msg)
            }
        })
    };

    return (
        <div>
            <Button onClick={handleSubmit}></Button>
        </div>
    );
}
```

### 项目开发

```

```

