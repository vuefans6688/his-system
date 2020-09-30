import service from '@/utils/request'
import { getSheBaoHead } from '@/serve/she-bao-head'
import { connect } from '@/serve/api'
import { MessageBox } from 'element-ui'

export default function () {
  return new Promise((resolve, reject) => {
    const shebaoInfo = getSheBaoHead()
    if (!shebaoInfo.hospitalCode) {
      resolve(false)
      return
    }
    service(connect).then(res => {
      if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
        // 成功的回调，直接返回data
        let errorInfo = ''
        switch (res.transBody.serverstatus) {
          case '1':
            resolve('1')
            break
          case '2':
            resolve('2')
            errorInfo = '连接社保服务状态异常'
            break
          case '3':
            resolve('3')
            errorInfo = '数据库连接异常'
            break
          default:
            break
        }
        if (errorInfo.length) { 
          MessageBox.alert(errorInfo, '错误提示', {
            confirmButtonText: '确定',
            callback: () => {}
          })
        }
      }
    }).catch(() => {
      reject(new Error('抛出异常'))
      MessageBox.alert('社保客户端连接失败，请确认是否开启客户端？', '错误提示', {
        confirmButtonText: '确定',
        callback: () => {}
      })
    })
  })
}
