String.prototype.padding = function (n, c) {
  var val = this.valueOf()
  if (Math.abs(n) <= val.length) {
    return val
  }
  var m = Math.max((Math.abs(n) - this.length) || 0, 0)
  var pad = Array(m + 1).join(String(c || ' ').charAt(0))
  return (n < 0) ? pad + val : val + pad
}

Number.prototype.toDigit = function (digit) {
  var t = this
  var s = t.toString()
  if (s.length < digit) {
    s = '0'.repeat(digit - s.length) + s
  }
  return s
}

Date.prototype.yyyymmdd = function () {
  let d = new Date(this)

  return `${d.getFullYear()}-${(d.getMonth() + 1).toDigit(2)}-${d.getDate().toDigit(2)}`
}

Date.prototype.yyyymmddhhmmss = function (middleChar = ' ', removeTimeOffset = false) {
  let d = new Date(this.valueOf())
  if (removeTimeOffset) {
    d.setMinutes(d.getMinutes() + (new Date()).getTimezoneOffset())
  }

  return `${d.getFullYear()}-${(d.getMonth() + 1).toDigit(2)}-${d.getDate().toDigit(2)}${middleChar}${d.getHours().toDigit(2)}:${d.getMinutes().toDigit(2)}:${d.getSeconds().toDigit(2)}`
}

global.eventLog = function (obj, ...placeholders) {
  console.log(new Date().yyyymmddhhmmss(), obj, ...placeholders)
}

global.errorLog = function (obj, ...placeholders) {
  console.error(new Date().yyyymmddhhmmss().red, obj, ...placeholders)
}

global.warnLog = function (obj, ...placeholders) {
  console.error(new Date().yyyymmddhhmmss().yellow, obj, ...placeholders)
}


global.devLog = (...props) => {
  if (process.env.NODE_ENV === 'development') {
    eventLog(...props)
  }
}

global.devError = (...props) => {
  if (process.env.NODE_ENV === 'development') {
    errorLog(...props)
  }
}

exports.moduleLoader = (folder, suffix) => {
  return new Promise((resolve, reject) => {
    try {
      let holder = {}
      let files = fs.readdirSync(folder)
      files.forEach((e) => {
        let f = path.join(folder, e)
        if (!fs.statSync(f).isDirectory()) {
          let fileName = path.basename(f)
          let apiName = fileName.substr(0, fileName.length - suffix.length)
          if (apiName != '' && (apiName + suffix) == fileName) {
            holder[apiName] = require(f)
          }
        }
      })
      resolve(holder)
    } catch (err) {
      reject(err)
    }
  })
}

exports.osBaseInfo = () => {
  const obj = {
    hostname: os.hostname(),
    platform: os.platform(),
    release: os.release(),
    type: os.type(),
    tmpdir: os.tmpdir(),
    totalmem: os.totalmem(),
    freemem: os.freemem(),
    uptime: os.uptime(),
    userInfo: os.userInfo(),
  }

  return obj
}

exports.encodeBase64 = (data) => {
  return Buffer.from(data).toString('base64')
}

exports.decodeBase64 = (data) => {
  return Buffer.from(data, 'base64').toString('ascii')
}

exports.htmlEval = (html, values = {}) => {
  let code = ''
  try {

    Object.keys(values).forEach((key) => {
      if (key != 'class')
        code += `let ${key}=${JSON.stringify(values[key])}\n`
    })
    code += `return \`${html}\``
    let f = new Function(code)
    return f()
  } catch (tryErr) {
    console.log(`tryErr`, tryErr)
  }
  return html
}


exports.showAppInfo = function () {

  const path = require('path')
  require('dotenv').config()
  const packageInfo = require(path.join(__root, 'package.json'))
  const clientId = process.env.CLIENT_ID || ''
  const clientPass = process.env.CLIENT_PASS || ''
  console.log('-'.repeat(70))
  console.log('Application Name:'.padding(25), packageInfo.name.toUpperCase().brightYellow)
  console.log('Version:'.padding(25), packageInfo.version.brightGreen)
  console.log('Socket Server URI:'.padding(25), (process.env.SOCKET_SERVER_URL || '').cyan)
  console.log('Uptime Started:'.padding(25), process.env.UPTIME_STARTED ? new Date(process.env.UPTIME_STARTED).yyyymmddhhmmss().white : 'UPTIME_STARTED is empty')
  console.log('Copyright:'.padding(25), `2014-${new Date().getFullYear()} (c) ${(packageInfo.author || '')}`.green)
  console.log('')
  console.log('-'.repeat(70))
  console.log('CLIENT ID:'.padding(25), (clientId || '').brightMagenta)
  console.log('CLIENT PASS:'.padding(25), (clientPass || '').brightMagenta)

  console.log('-'.repeat(70))
}