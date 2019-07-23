import '@pefish/js-node-assist'
import shelljs from 'shelljs'
import ErrorHelper from '@pefish/js-error'

declare global {
  namespace NodeJS {
    interface Global {
      logger: any,
    }
  }
}

export default class ShellHelper {
  private shell
  public result
  private toClean

  constructor () {
    this.shell = shelljs
    this.toClean = {} // 待清理的处于脱离状态的子进程。应当在父进程退出前清理掉
  }

  killProcessGroup (gid: number | string) {
    this.execSyncInSilent(`kill -1 -- -${gid}`)
  }

  cleanAllDetachedProcess () {
    for (let process_ of Object.values(this.toClean)) {
      try {
        this.killProcessGroup(process_[`pid`])
      } catch (err) {

      }
    }
    this.toClean = {}
  }

  cleanDetachedProcess (pid: number | string) {
    if (this.toClean[pid]) {
      try {
        this.killProcessGroup(pid)
      } catch (err) {

      }
      delete this.toClean[pid]
    }
  }

  /**
   * 改变主进程的当前目录。影响子进程的工作目录
   * @param path
   * @param mkIfNotExist
   * @returns {ShellHelper}
   */
  cd (path: string, mkIfNotExist: boolean = false) {
    global.logger.debug(`>>>>>>>> cd ${path}`)
    this.result = this.shell.cd(path)
    if (this.result['code'] !== 0) {
      if (mkIfNotExist === true && this.result['stderr'].startsWith('cd: no such file or directory')) {
        global.logger.info(`目录不存在，创建目录`)
        this.execSync(`mkdir -p ${path}`)
        this.result = this.shell.cd(path)
      } else {
        throw new ErrorHelper(`\n${this.result['stderr']}`, 0)
      }
    }
    return this
  }

  existsPath (path: string) {
    global.logger.debug(`>>>>>>>> 判断目录是否存在`)
    this.result = this.execSync(`if [ -d "${path}" ]; then echo true; else echo false; fi`, {
      silent: true
    }).result
    return this.result['stdout'] === 'true\n'

    // this.result = this.shell.exec(`ls ${path}`, {
    //   silent: true
    // })
    // return !(this.result['code'] !== 0 && this.result['stderr'].endsWith('No such file or directory\n'))
  }

  existsFile (filepath: string) {
    global.logger.debug(`>>>>>>>> 判断文件是否存在`)
    this.result = this.execSync(`if [ -f "${filepath}" ]; then echo true; else echo false; fi`, {
      silent: true
    }).result
    return this.result['stdout'] === 'true\n'

    // this.result = this.shell.exec(`cat ${filepath}`, {
    //   silent: true
    // })
    // return !(this.result['code'] !== 0 && (this.result['stderr'].endsWith('No such file or directory\n') || this.result['stderr'].endsWith('Is a directory\n')))
  }

  /**
   * 同步执行命令(使用子进程执行的)
   * @param str
   * @param opts {object} async: Asynchronous execution. If a callback is provided, it will be set to true, regardless of the passed value (default: false).
                         silent: Do not echo program output to console (default: false).
                         encoding: Character encoding to use. Affects the values returned to stdout and stderr, and what is written to stdout and stderr when not in silent mode (default: 'utf8').
                         and any option available to Node.js's child_process.exec()
   * @returns {ShellHelper}
   */
  execSync (str: string, opts: {} = {}) {
    global.logger.debug(`>>>>>>>> ${str}`)
    this.result = this.shell.exec(str, opts)
    if (this.result['code'] !== 0) {
      throw new ErrorHelper(`\n${this.result['stderr']}`, 0)
    }
    return this
  }

  execSyncInSilent (str: string, opts: {} = {}) {
    global.logger.debug(`>>>>>>>> ${str}`)
    this.result = this.shell.exec(str, Object.assign(opts, { silent: true }))
    if (this.result['code'] !== 0) {
      throw new ErrorHelper(`\n${this.result['stderr']}`, 0)
    }
    return this
  }

  execSyncForResult (str: string, opts: {} = {}) {
    global.logger.debug(`>>>>>>>> ${str}`)

    const result = this.shell.exec(str, opts)
    if (result['code'] !== 0) {
      throw new ErrorHelper(`\n${result['stderr']}`, 0)
    }
    return result
  }

  /**
   * 异步执行命令
   * @param str {string} 要执行的命令
   * @param cb {function} 命令执行完后调用此方法
   * @param opts
   * @returns {child_process}
   */
  execAsync (str: string, cb: (code: number, stdout: string, stderr: string) => void, opts: {} = {}) {
    global.logger.debug(`>>>>>>>> ${str}`)
    this.result = this.shell.exec(str, Object.assign(opts, {
      async: true
    }), cb)
    return this
  }

  /**
   * 异步执行命令。子进程脱离父进程自己成组, 杀死父进程后，子进程不会退出(正常情况下是子进程的组id继承自父进程, 脱离的进程的组id与进程id一致)
   * 注意：传递的环境变量必须是字符串，不能是 `pwd` 等需要执行的东西
   * @param str {string} 要执行的命令
   * @param cb {function} 子进程退出后后调用此方法
   * @param unref {boolean} 是否不让父进程等待子进程退出后才退出
   * @param opts
   * @returns {ShellHelper}
   */
  execAsyncDetach (str: string, cb: (code: number) => void = null, unref: boolean = false, opts: {} = {}) {
    global.logger.debug(`>>>>>>>> ${str}`)
    const { spawn } = require('child_process')

    const { envs, file, args} = this._parseCommand(str)
    const subprocess = spawn(file, args, Object.assign(opts, {
      detached: true,
      stdio: opts['silent'] ? 'ignore' : 'inherit',
      env: Object.assign(process.env, envs)
    }))

    subprocess.on('close', (code) => {
      this.toClean[subprocess.pid] && (delete this.toClean[subprocess.pid])
      cb && cb(code)
    })

    unref === true && subprocess.unref()

    this.result = subprocess
    this.toClean[subprocess.pid] = subprocess

    return this
  }

  _parseCommand (str: string) {
    const result = {
      envs: {},
      file: null,
      args: []
    }
    const arrs = str.split(' ')
    for (let a of arrs) {
      if (a.indexOf(`=`) !== -1) {
        const temp = a.split('=')
        result['envs'][temp[0]] = temp[1]
      } else {
        if (!result['file']) {
          result['file'] = a
        } else {
          result['args'].push(a)
        }
      }
    }
    return result
  }

  /**
   * 杀死子进程
   */
  killChildProcess () {
    // this.result.kill('SIGHUP')
    this.shell.exec(`kill -9 ${this.result.pid}`, {
      silent: true
    })
  }

  checkCmdExist (cmd: string) {
    const result = this.shell.exec(`source /etc/profile && which is ${cmd}`, {
      silent: true
    })
    return result['stdout'] !== ''
  }
}
