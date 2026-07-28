const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const source = fs.readFileSync('Nodeseek Pro.user.js', 'utf8');

test('uses the Max-iSen identity in the userscript menu', () => {
    assert.match(source, /@name\s+Nodeseek Max-iSen/);
    assert.match(source, /@icon\s+https:\/\/raw\.githubusercontent\.com\/EISEN0516\/nodeseek-pro-userscript\/main\/docs\/images\/nodeseek-max-isen-icon\.png/);
    assert.match(source, /text: "⚙️ 全局设置"/);
    assert.match(source, /text: "🍗 签到方式"/);
    assert.match(source, /GM_registerMenuCommand\("🎁 抽奖提醒", openPanel\)/);
    assert.doesNotMatch(source, /text: "⚙️ 高级设置"/);
    assert.doesNotMatch(source, /GM_registerMenuCommand\("🎁 打开抽奖提醒"/);
});

test('renders a flat numbered settings system without a search control', () => {
    assert.match(source, /cont\.id = "nsx-config-shell"/);
    assert.match(source, /nsx-config-section-index/);
    assert.match(source, /sectionIndex = index => String\(index \+ 1\)\.padStart\(2, "0"\)/);
    assert.match(source, /grid-template-columns:28px 24px minmax\(0,1fr\) 30px/);
    assert.match(source, /nsx-config-menu-emoji/);
    assert.match(source, /nsx-config-section-emoji/);
    assert.match(source, /"配置备份": "💾"/);
    assert.match(source, /const card = el\("section", "layui-form nsx-config-card"\)/);
    assert.doesNotMatch(source, /nsx-config-search/);
    assert.doesNotMatch(source, /layui-card layui-form nsx-config-card/);
});

test('keeps settings usable on narrow screens', () => {
    assert.match(source, /@media\(max-width:720px\)\{/);
    assert.match(source, /#nsx-config-shell\{flex-direction:column\}/);
    assert.match(source, /#nsx-config-menu \.layui-menu\{display:flex;[^}]*overflow-x:auto/);
    assert.match(source, /#nsx-config-menu \.layui-menu a\{grid-template-columns:auto 20px auto/);
    assert.match(source, /max-width:100vw!important;\s*box-sizing:border-box/);
    assert.match(source, /#setting-layer-direction-r\{right:0!important;width:100vw!important;max-width:100vw!important;height:100vh!important;height:100dvh!important/);
    assert.match(source, /#setting-layer-direction-r \.layui-layer-btn a\{min-width:88px;min-height:42px/);
    assert.match(source, /#setting-layer-direction-r \.layui-layer-setwin \.layui-layer-close\{[^}]*width:40px!important;height:40px!important/);
    assert.match(source, /\.nsx-config-card \.layui-input,[^}]*min-height:44px;font-size:16px!important/);
    assert.match(source, /window\.innerWidth <= 720 \|\| window\.layui\.device\(\)\.mobile \? "100%"/);
});

test('masks sensitive values and keeps card toggles scoped to the new body', () => {
    assert.match(source, /\(api\[_-\]\?key\|token\|secret\|password\|webhook\)/);
    assert.match(source, /sensitive \? "password" : "text"/);
    assert.match(source, /card\.querySelectorAll\("\.nsx-config-card-body input,\.nsx-config-card-body select,\.nsx-config-card-body textarea"\)/);
    assert.match(source, /querySelectorAll\("\.nsx-config-section\[id\^='group-'\]"\)/);
    assert.match(source, /g\.getBoundingClientRect\(\)\.top - contentTop <= 50/);
});

console.log('settings UI behavior: all tests passed');
