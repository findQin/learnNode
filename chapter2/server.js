
// HTTP服务器和客户端相关功能
var http = require('http');
// 文件系统相关功能
var fs = require('fs');
// 内置path模块提供与文件系统路径相关功能
var path = require('path');
// mime模块有根据文件扩展名得出MIME类型的能力
var mime = require('mime');
// 缓存文件对象
var cache = {};


// 1. 发送文件数据以及错误响应
function sendFile(response, filePath, fileContents) {
    response.writeHead(
        200, 
        {"content-type": mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents);
}
function send404(response) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404: resource not found.');
    response.end();
}

// 2. 提供静态文件服务
function serveStatic(response, cache, absPath) {
    // 检查缓存中是否存在
    if (cache[absPath]) {
        sendFile(response, absPath, cache[absPath])
    } else {
        // 检查文件是否存在
        fs.exists(absPath, function(exists) {
            if (exists) {
                // 从硬盘中读取文件
                fs.readFile(absPath, function(err, data) {
                    if (err) {
                        send404(response);
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            }
            else {
                send404(response);
            }
        });
    }
}

// 3. 创建HTTP服务器
var server = http.createServer(function(request, response) {
    var filePath = false;
    if (request.url == '/') {
        // 默认HTML文件
        filePath = 'public/index.html';
    }
    else {
        // URL路径转化为文件的相对路径
        filePath = 'public' + request.url;
    }
    var absPath = './' + filePath;
    serveStatic(response, cache, absPath);
});


// 4. 启动服务器
server.listen(3000, function(){
    console.log("Server listening on port 3000.");
})


// 设置Socket.IO服务器
var chatServer = require('./lib/chat_server');
chatServer.listen(server);
