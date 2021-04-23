const express = require('express');
const { existsSync, readFileSync } = require('fs')

function renderConfig({configPath=''}) {
    let config
    if (!existsSync(configPath)) {
        throw new Error(`> 配置模板不存在: ${configPath}`)
    }
    console.log()
    console.log(`> 配置模板路径: ${configPath}`)
    try {
        const configFile = readFileSync(configPath, { encoding: 'utf8' })
        config = JSON.parse(configFile.replace(/\/\*注释\*\/.*/g, ''))
        console.info('> 配置模板编译成功')
    } catch (error) {
        throw new Error(`> 配置模板编译出错: ${error.message}`)
    }
    console.log()
    return config
}
function getFileExt(filename:string) {
  return filename.split('.').pop()
}

const scriptStr = (file:any) => `<script src="${file}"></script>`
const linkStr = (file:any) => `<link href="${file}" rel="stylesheet"/>`

export const getAppConfigs = ({configPath = ''})=>{
  /**
   * Node.js 单例模式（不使用 Class）
   * 参考: https://derickbailey.com/2016/03/09/creating-a-true-singleton-in-node-js-with-es6-symbols/
   */
  // create a unique, global symbol name
  // -----------------------------------
  const CONFIG_KEY = Symbol.for('Config')
  // check if the global object has this symbol
  // add it if it does not have the symbol, yet
  // ------------------------------------------
  const globalSymbols = Object.getOwnPropertySymbols(global)
  const hasConifg = globalSymbols.indexOf(CONFIG_KEY) > -1
  if (!hasConifg) {
    // @ts-ignore
      global[CONFIG_KEY] = renderConfig({configPath})
  }
  // define the singleton API
  // ------------------------
  const singleton = {}
  Object.defineProperty(singleton, 'instance', {
      get() {
        // @ts-ignore
          return global[CONFIG_KEY]
      },
  })
  Object.freeze(singleton)
  // @ts-ignore
  return singleton.instance
}

export const getTemplate = ({prefix='/pherusa',configString='{}',entrypoints=[],title='来也科技',externalJs=[],externalCss=[]})=>{
  const icon = `<link href="https://cdn.wul.ai/official/img/favicon.ico" rel="icon" as="image">`
  const extJs = externalJs
      .map(file => scriptStr(file))
      .join('')
  const extCss = externalCss.map(file => linkStr(file)).join('')
  const reactJs = entrypoints
      .filter(file => getFileExt(file) === 'js')
      .map(file => scriptStr(prefix+'/' + file))
      .join('')
  const reactCss = entrypoints
      .filter(file => getFileExt(file) === 'css')
      .map(file => linkStr(prefix+'/' + file))
      .join('')

  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,height=device-height,inital-scale=1.0,maximum-scale=1.0,user-scalable=no;"/><meta name="keywords" content="人工智能,智能机器人,智能客服,聊天机器人,自然语言处理,人机对话,语义理解,语义分析,Chatbot,来也网络,吾来,小来,助理来也,人工智能客服,汪冠春,胡一川, RPA, UiBot, RPA+AI, AI, 机器人流程自动化, 人机协同"/><meta name="description" content="来也科技创办于2015年，由常春藤盟校（Ivy League）机器学习博士团队发起，致力于做人机共生时代具备全球影响力的智能机器人公司。核心技术涵盖深度学习、强化学习、机器人流程自动化（RPA）、自然语言处理（NLP）、个性化推荐和多轮多模交互等。公司已获得数十项专利和国家高新技术企业认证。"/>${icon}<title>${title}</title>${extCss}${reactCss}</head><body><div id="root"></div><script>window.APP_CONFIGRATION=${configString}</script>${extJs}${reactJs}</body></html>`
}

export const start = ({
  title='',
  prefix='/pherusa',
  staticPath='build',
  entrypoints=[],
  configPath='',
  externalJs=[],
  externalCss=[]
})=>{
  const app = express();
  const config:any = getAppConfigs({configPath});
  const { port } = config.env;
  const html = getTemplate({
    title,
    prefix,
    entrypoints,
    configString:JSON.stringify(config),
    externalJs,
    externalCss
  });
  app.get('/healthz', (_:any, res:any) => {
    res.send('OK');
  });
  app.use(prefix,express.static(staticPath));
  app.get('/*', (_:any, res:any) => {
    res.send(html);
  });
  app.listen(port, () => console.log(`> Server is running on 127.0.0.1:${port}`));
}
