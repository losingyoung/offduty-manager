async function loadHtml(ele, url) {
    await fetch(url).then(res => {
        return res.text()
    }).then(html => {
        ele.innerHTML = html
    })
}
async function loadPage(option ={}) {
    const target = option.ele
    if (!target) {
        throw new Error('load page: no target element in option.ele')
    }
    const htmlUrl = option.url
    if (!target) {
        throw new Error('load page: no page url in option.url')
    }
    const scriptUrls = option.scripts
    await loadHtml(target, htmlUrl)
    // scriptUrls && loadScripts(scriptUrls)

}
function loadScripts(urls) {
    urls.forEach(url => {
        _loadScript(url)
    });
}
function _loadScript(url) {
    const script = document.createElement('script')
    script.innerHTML = `require('${url}')`
    document.getElementsByTagName('body')[0].appendChild(script)

}
module.exports = {
    loadPage,
    loadScripts
}