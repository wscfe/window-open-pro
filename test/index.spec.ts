/*
 * @Author: wangshicheng
 * @Date: 2021-09-11 16:14:43
 * @Description: 测试文件
 * @FilePath: /window-open-pro/test/index.spec.ts
 */
import { getErr } from '../src/index'

/**
 * getErr test
 */
describe('getErr test1', () => {
  test('should return a string value', () => {
    const result = getErr('异常消息')

    expect(result).toBe('异常消息')
  })
})

describe('getErr test2', () => {
  test('should return a Object value', () => {
    const result = getErr({ msg: '异常消息' })

    expect(result).toBe('{"msg":"异常消息"}')
  })
})
