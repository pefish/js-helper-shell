import assert from "assert"
import ShellHelper from './shell'

describe('ShellHelper', () => {

  let helper

  before(async () => {
    helper = new ShellHelper()
  })

  // it('_parseCommand', async () => {
  //   try {
  //     const result = helper._parseCommand(`ABC=12 RT=54 go start oyuy`)
  //     logger.error(result)
  //     // result.kill('SIGHUP')
  //     // assert.strictEqual(result, true)
  //   } catch (err) {
  //     assert.throws(() => {}, err)
  //   }
  // })

  it('withEnv', async () => {
    try {
      const result = helper.withEnv("TEST", "123").execSync("echo $TEST")
      // console.error("result", result.stdout)
      // result.kill('SIGHUP')
      // assert.strictEqual(result, true)
    } catch (err) {
      assert.throws(() => {}, err)
    }
  })

  // it('execAsyncDetach', async () => {
  //   try {
  //     const result = helper.execAsyncDetach(`TEST=test echo 5657`)
  //     // global.logger.error(result)
  //     // result.kill('SIGHUP')
  //     // assert.strictEqual(result, true)
  //   } catch (err) {
  //     assert.throws(() => {}, err)
  //   }
  // })

  // it('killChildProcess', async () => {
  //   try {
  //     helper.execAsync(`top`)
  //     helper.killChildProcess()
  //   } catch (err) {
  //     assert.throws(() => {}, err)
  //   }
  // })

  // it('execSync', async () => {
  //   try {
  //     const result = helper.execSync(`top`)
  //     // logger.error(result)
  //     logger.error('11111')
  //     // result['result'].kill('SIGHUP')
  //     // assert.strictEqual(result, true)
  //   } catch (err) {
  //     assert.throws(() => {}, err)
  //   }
  // })

  // it('execAsync', async () => {
  //   try {
  //     const result = helper.execAsync(`echo 676`, () => {
  //       logger.error('000')
  //     })
  //     logger.error(result.result.pid)
  //     // result.kill('SIGHUP')
  //     // assert.strictEqual(result, true)
  //   } catch (err) {
  //     assert.throws(() => {}, err)
  //   }
  // })

  // it('checkCmdExist', async () => {
  //   try {
  //     const result = helper.checkCmdExist(`ls`)
  //     // logger.error(result)
  //     assert.strictEqual(result, true)
  //   } catch (err) {
  //     assert.throws(() => {}, err)
  //   }
  // })

  // it('execSyncInSilent', async () => {
  //   try {
  //     helper.execSyncInSilent(`git clone https://gitee.com/pefish/go_utils /Users/joy/Work/backend/go_manager/src/vendor/gitee.com/pefish/go_utils -b v1.0.9 --recurse-submodules --shallow-submodules --depth 1 --single-branch`)
  //   } catch (err) {
  //     assert.throws(() => {}, err)
  //   }
  // })

  // it('cd', async () => {
  //   try {
  //     helper.cd('/Users/joy/aaa', true).execSync('ls')
  //   } catch (err) {
  //     assert.throws(() => {}, err)
  //   }
  // })
  //
  // it('existsPath', async () => {
  //   try {
  //     const result = helper.existsPath('/Users/joy/111')
  //     assert.strictEqual(result, false)
  //
  //     const result1 = helper.existsPath('/Users/joy')
  //     assert.strictEqual(result1, true)
  //   } catch (err) {
  //     assert.throws(() => {}, err)
  //   }
  // })
  //
  // it('existsFile', async () => {
  //   try {
  //     const result = helper.existsFile('/Users/joy/aaa')
  //     assert.strictEqual(result, false)
  //
  //     const result1 = helper.existsFile('/Users/joy/aaa/1')
  //     assert.strictEqual(result1, true)
  //   } catch (err) {
  //     assert.throws(() => {}, err)
  //   }
  // })
})
