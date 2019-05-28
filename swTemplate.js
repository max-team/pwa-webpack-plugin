/**
 * service-worker auto-generated
 */

module.exports = `

const IMG_REG = /\.(png|jpg|jpeg|gif|webp)$/;
const JS_CSS_REG = /\.(js|css)$/;

function fetchServer(cacheName, request) {
    return fetch(request).then(response => {
        let resCopy = response.clone();
        caches.open(cacheName).then(cache => {
            cache.put(request.url, resCopy);
        });
        return response;
    });
}

function networkFirst(cacheName, request) {
    // 请求网络数据并缓存
    console.log('network first ..........................' + request.url);
    return fetchServer(cacheName, request).catch(() => {
        console.log('网络获取失败，从缓存中取')
        return caches.match(request.url);
    });
}

function cacheFirst(cacheName, request) {
    console.log('cache first ..........................' + request.url);
    return caches.match(request.url).then(response => {
        return response || fetchServer(cacheName, request);
    }).catch(err => {
        console.log(err);
        return fetch(request);
    })
}

// import precache and cacheName
<% if (importScripts) { 
    importScripts.forEach(item => {%>
importScripts(<%= JSON.stringify(item) %>);
<%  })

} %>

// import precache list
<% if (precacheList) {%>
    <%= precacheList %>
<% } %>

// import blackManifest list 
<% if (blackManifestList) {
    const blackListString = [];
    const blackListReg = []
    blackManifestList.forEach(item => { 
        typeof item === 'string'
            ? blackListString.push(item)
            : item instanceof RegExp
                ? blackListReg.push(item)
                : null;
    }) %>
    self.blackCacheListString = <%= JSON.stringify(blackListString) %>;
    self.blackCacheListReg = [<%= blackListReg%>];
<% } %>

// 生成 manifestName
<% if (manifestName) {%>
    self.cacheName = <%= JSON.stringify(manifestName)%>;
<% } %>   

// 监听install事件，安装完成后，进行文件缓存
self.addEventListener('install', e => {
    console.log('Service Worker 状态： install');
    let cacheOpenPromise = caches.open(self.cacheName).then(cache => cache.addAll(self.__precacheManifest));
    e.waitUntil(cacheOpenPromise);
});

self.addEventListener('fetch', e => {
    const request = e.request;
    const url = request.url;

    // request 命中 默认exlude缓存，则直接返回
    if (self.blackCacheListReg.some(item => item.test(url))
    || self.blackCacheListString.some(item => url.indexOf(item) > -1)) {
        return;
    }
    // 如果有precache则直接返回，否则通过fetch请求
    if (self.__precacheManifest.some(item => url.indexOf(item) > -1)) {
        return e.respondWith(cacheFirst(self.cacheName, request));
    }

    // 图片使用缓存优先
    if(IMG_REG.test(url)) {
        return e.respondWith(cacheFirst(self.cacheName, request));
    }

    // 其他文件：css、js、xhr使用 网络优先策略
    // if (JS_CSS_REG.test(url)) {
        return e.respondWith(networkFirst(self.cacheName, request));
    // }
});

// 监听activate事件，激活后通过cache的key来判断是否更新cache中的静态资源
self.addEventListener('activate', e => {
    console.log('Service Worker 状态： activate');
    let cachePromise = caches.keys().then(keys => {
        return Promise.all(keys.map(key => {
            if (key !== self.cacheName) {
                console.log('deleting.............' + key);
                return caches.delete(key);
            }
        }));
    })
    e.waitUntil(cachePromise);
    return self.clients.claim();
});
`;
