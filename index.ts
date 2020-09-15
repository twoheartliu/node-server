import * as http from 'http';
import {IncomingMessage, ServerResponse} from 'http';
import * as fs from 'fs';
import * as p from 'path';
import * as url from 'url';

let cacheAge = 3600 * 24 * 365;

const staticDir = p.resolve(__dirname, 'static');
// 用 http 创建 server
const server = http.createServer();
// 当 server 发送请求则执行回调函数
server.on('request', (request: IncomingMessage, response: ServerResponse) => {
  const {method, url: path, headers} = request;
  // url.parse 得到不含查询字符串的基本路径
  const {pathname, search} = url.parse(path);
  if (method !== 'GET') {
    response.statusCode = 405;
    response.end();
  }
  let fileName = pathname.substr(1);
  if (fileName === '') {
    fileName = 'index.html';
  }
  fs.readFile(p.resolve(staticDir, fileName), (error, data) => {
    if (error) {
      if (error.errno === -2) {
        response.statusCode = 404;
        fs.readFile(p.resolve(staticDir, '404.html'), (error, data) => {
          response.end(data);
        });
      } else {
        response.statusCode = 500;
        response.end('服务器繁忙');
      }
    } else {
      response.setHeader('Cache-Control', `public, max-age=${cacheAge}`);
      response.end(data);
    }
  });
});
// 监听 8888 端口
server.listen('8888');