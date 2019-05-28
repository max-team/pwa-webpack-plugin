const stringifyManifest = require('./stringifyManifest');
const convertStringToAsset = require('./convertStringToAsset');
const swTemplate = require('./swTemplate');
const template = require('lodash.template');

const CACHE_NAME = 'MARS_PWA_CACHE';
class MarsPwaPlugin {
    // 在构造函数中获取用户给该插件传入的配置
    constructor(options) {
        this.cacheName = options.cacheName || 'mars-project-1-0-0';
        this.include = options.include || [];
        this.exclude = options.exclude instanceof Array
            ? options.exclude
            : typeof options.exclude === 'string' ? [options.exclude] : [];
    }
    
    // Webpack 会调用 BasicPlugin 实例的 apply 方法给插件实例传入 compiler 对象
    apply(compiler){
        const blackManifestList = [ /\.map$/, /img\/icons\//, /favicon\.ico$/, /manifest\.json$/ ];
        const whiteManifestList = [/\.html$/];
        this.include = this.include.concat(whiteManifestList);
        compiler.hooks.emit.tap('supportPWA', compilation => {
            const {
                assets,
                chunks
            } = compilation;
            let assetManifestList = [];
            Object.keys(assets).forEach(file => {
                let isBlackFile = false;
                let isWhiteFile = false;
                blackManifestList.forEach(reg => {
                    if (reg.test(file)) {
                        isBlackFile = true;
                    }
                });
                this.include.forEach(reg => {
                    if (reg.test(file)) {
                        isWhiteFile = true;
                    }
                });
                let filePathArr = file.split('/');
                let fileFullName = filePathArr[filePathArr.length -1];
                let fileNameArr = fileFullName.split('.');
                let fileName = fileNameArr[0];
                let fileType = fileNameArr[fileNameArr.length -1];
                // 缓存名单优先级：isBlackFile > exclude > isWhiteFile
                !isBlackFile
                && !this.exclude.includes(`${fileName}.${fileType}`)
                && isWhiteFile
                && assetManifestList.push(file);
            });

            // 输出 precache-manifest.js 文本
            const assetManifestString = stringifyManifest(assetManifestList);
            // const manifestAsset = convertStringToAsset(assetManifestString);
            // compilation.assets['precache-manifest.js'] = manifestAsset;

            // 输出 precache-version.js 文本
            const manifestName = `${CACHE_NAME}-${this.cacheName}`;
            // const manifestNameAsset = convertStringToAsset(manifestName);
            // compilation.assets['precache-name.js'] = manifestNameAsset;

            // 生成 sw 文件
            const swString = template(swTemplate)({
                importScripts: [],
                precacheList: assetManifestString,
                blackManifestList: blackManifestList.concat(this.exclude),
                manifestName
            });
            const swAsset = convertStringToAsset(swString);
            compilation.assets['sw.js'] = swAsset;
        });
    }

    
  }
  
  // 导出 Plugin
  module.exports = MarsPwaPlugin;
