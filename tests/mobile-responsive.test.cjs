const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const scriptPath = path.join(__dirname, '..', 'Nodeseek Pro.user.js');
const source = fs.readFileSync(scriptPath, 'utf8');

function loadMobileDetector() {
    const start = source.indexOf('const detectMobileClient = ');
    assert.notEqual(start, -1, 'mobile detector must be defined');
    const end = source.indexOf('\n\n', start);
    assert.notEqual(end, -1, 'mobile detector must end before a blank line');

    const declaration = source.slice(start, end).replace(/^const /, 'var ');
    const context = {};
    vm.runInNewContext(`${declaration}\nresult = detectMobileClient;`, context);
    return context.result;
}

function extractResponsiveCss() {
    const match = source.match(/const RESPONSIVE_CSS = `([\s\S]*?)`;\n/);
    assert.ok(match, 'responsive CSS must be present');
    return match[1];
}

const css = extractResponsiveCss();
const mobileBaseCss = css.slice(0, css.indexOf('@media(max-width:420px)'));

test('detects Redmi Via desktop mode without misclassifying a touch laptop', () => {
    const detectMobileClient = loadMobileDetector();

    assert.equal(detectMobileClient({
        userAgent: 'Mozilla/5.0 (Linux; Android 14; 24069RA21C) AppleWebKit/537.36 Chrome/126 Safari/537.36 Via',
        userAgentMobile: false,
        viewportWidth: 980,
        screenWidth: 393,
        screenHeight: 873,
        coarsePointer: true,
        maxTouchPoints: 5
    }), true);

    assert.equal(detectMobileClient({
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36',
        userAgentMobile: false,
        viewportWidth: 1366,
        screenWidth: 1366,
        screenHeight: 768,
        coarsePointer: true,
        maxTouchPoints: 10
    }), false);

    assert.equal(detectMobileClient({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36',
        userAgentMobile: false,
        viewportWidth: 600,
        screenWidth: 1920,
        screenHeight: 1080,
        coarsePointer: false,
        maxTouchPoints: 0
    }), true);
});

test('detects representative mobile browser families', () => {
    const detectMobileClient = loadMobileDetector();
    const mobileAgents = [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Version/18.0 Safari/604.1',
        'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36 SamsungBrowser/25.0',
        'Mozilla/5.0 (Android 14; Mobile; rv:126.0) Gecko/126.0 Firefox/126.0',
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36 EdgA/126.0',
        'Mozilla/5.0 (Linux; Android 14; CPH2581) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36 OPR/82.0',
        'Mozilla/5.0 (Linux; Android 14; HBN-AL00) AppleWebKit/537.36 Chrome/114.0 Mobile Safari/537.36 HuaweiBrowser/15.0',
        'Mozilla/5.0 (Linux; U; Android 14; zh-CN; 24031PN0DC) AppleWebKit/537.36 Mobile Safari/537.36 UCBrowser/15.0',
        'Mozilla/5.0 (Linux; Android 14; MEIZU 20) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36 MQQBrowser/14.9',
        'Mozilla/5.0 (Linux; Android 14; RMX3851) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36 Brave/126.0',
        'Mozilla/5.0 (Linux; Android 14; MEIZU 20) AppleWebKit/537.36 Chrome/126.0 Safari/537.36 Via'
    ];

    for (const userAgent of mobileAgents) {
        assert.equal(detectMobileClient({ userAgent, viewportWidth: 980 }), true, userAgent);
    }
});

test('keeps the mobile header and panels inside the live viewport', () => {
    assert.match(css, /\.nsx-mobile #nsk-head\{display:grid!important;/);
    assert.match(css, /\.nsx-mobile #nsk-head \.color-theme-switcher\{[^}]*position:static!important/);
    assert.match(css, /--nsx-mobile-panel-top/);
    assert.match(source, /visualViewport\?\.addEventListener\?\.\("resize", syncMobileLayout\)/);
    assert.match(source, /addEventListener\("orientationchange", syncMobileLayout/);
});

test('uses a horizontal floating toolbar on every mobile viewport', () => {
    assert.match(mobileBaseCss, /html\.nsx-mobile body\{[^}]*padding-bottom:calc\(56px \+ env\(safe-area-inset-bottom\)\)!important/);
    assert.match(mobileBaseCss, /\.nsx-mobile #fast-nav-button-group\{[^}]*display:flex!important;[^}]*flex-direction:row!important;[^}]*max-width:calc\(100vw - 16px\)!important;[^}]*overflow-x:auto/);
    assert.match(mobileBaseCss, /\.nsx-mobile #fast-nav-button-group \.nav-item-btn\{[^}]*position:static!important;[^}]*flex:0 0 40px/);
});

test('uses touch-sized controls and prevents input auto-zoom', () => {
    assert.match(css, /#nsx-icon-group>\*\{[^}]*min-width:40px!important;[^}]*min-height:40px!important/);
    assert.match(css, /\.nsx-mobile \.nsx-lottery-form-row input:not\(\[type=checkbox\]\)[^}]*font-size:16px!important/);
    assert.match(css, /#nsx-filter-panel button[^}]*min-height:40px!important/);
    assert.match(source, /\.nsx-mobile \.nsx-inline-communication \.nsx-communication-btn\{width:40px;min-width:40px;height:40px;min-height:40px/);
});

test('separates identity and actions for every mobile post row', () => {
    assert.match(css, /\.nsx-mobile \.nsk-content-meta-info\{[^}]*display:grid!important;[^}]*grid-template-columns:45px minmax\(0,1fr\);[^}]*grid-template-areas:"avatar identity" "avatar actions"/);
    assert.match(css, /\.nsx-mobile \.nsk-content-meta-info>:nth-child\(2\)\{[^}]*grid-area:identity;[^}]*min-width:0;[^}]*width:100%/);
    assert.match(css, /\.nsx-mobile \.nsk-content-meta-info>\.floor-link-wrapper\{[^}]*grid-area:actions;[^}]*width:100%;[^}]*justify-content:flex-start;[^}]*flex-wrap:wrap/);
    assert.match(css, /\.nsx-mobile \.nsk-content-meta-info>\.floor-link-wrapper\{[^}]*position:static!important;[^}]*inset:auto!important/);
    assert.match(css, /\.nsx-mobile \.content-item\.nsx-nested-item>\.nsk-content-meta-info\{[^}]*display:grid!important;[^}]*grid-template-columns:34px minmax\(0,1fr\);[^}]*grid-template-areas:"avatar identity" "avatar actions"/);
});

test('prevents injected mobile controls from shrinking or overlapping', () => {
    assert.match(css, /\.nsx-mobile \.nsk-content-meta-info>\.floor-link-wrapper>\*\{[^}]*position:static!important;[^}]*flex:0 0 auto!important/);
    assert.match(css, /\.nsx-mobile \.floor-link-wrapper \.nsx-relation-btn\{[^}]*position:static!important;[^}]*flex:0 0 auto!important;[^}]*min-width:40px!important;[^}]*min-height:40px!important/);
    assert.match(css, /\.nsx-mobile \.author-info\{[^}]*min-width:0;[^}]*width:100%;[^}]*flex-wrap:wrap/);
    assert.match(source, /\.nsx-mobile \.nsx-inline-communication \.nsx-communication-btn\{width:40px;min-width:40px;height:40px;min-height:40px;[^}]*flex:0 0 auto;[^}]*position:static!important/);
});

console.log('mobile responsive behavior: all tests passed');
