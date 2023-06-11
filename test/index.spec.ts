/*
 * @Author: wangshicheng
 * @Date: 2021-09-11 16:14:43
 * @Description: 测试文件
 * @FilePath: /clip-img/test/index.spec.ts
 */
import TsSdk from '../src/index'

/**
 * TsSdk test
 */
describe('TsSdk test', () => {
  test('should return a number muti value', () => {
    const a = 1
    const b = 3

    const result = TsSdk.add(a, b)

    expect(result).toBe(4)
  })
})
