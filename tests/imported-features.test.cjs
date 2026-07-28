const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("Nodeseek Pro.user.js", "utf8");

function extract(startMarker, endMarker) {
    const start = source.indexOf(startMarker);
    const end = source.indexOf(endMarker);
    assert.notEqual(start, -1, `missing ${startMarker}`);
    assert.notEqual(end, -1, `missing ${endMarker}`);
    assert.ok(end > start, `${startMarker} must precede ${endMarker}`);
    return source.slice(start + startMarker.length, end);
}

{
    const context = {};
    vm.runInNewContext(
        extract("/* COMMENT_FOOTPRINT_CORE_START */", "/* COMMENT_FOOTPRINT_CORE_END */")
        + "\nthis.postId = commentFootprintPostId;"
        + "\nthis.targetPage = commentFootprintTargetPage;",
        context
    );
    assert.equal(context.postId("https://www.nodeseek.com/post-835563-2#19"), 835563);
    assert.equal(context.postId("/post-42-1"), 42);
    assert.equal(context.postId("/categories/1"), null);
    assert.equal(context.targetPage(1, 15), 1);
    assert.equal(context.targetPage(15, 15), 1);
    assert.equal(context.targetPage(16, 15), 2);
    assert.equal(context.targetPage(31, undefined), 3);
}

{
    const context = { URL, URLSearchParams };
    vm.runInNewContext(
        extract("/* LINK_PURIFIER_CORE_START */", "/* LINK_PURIFIER_CORE_END */")
        + "\nthis.parseRules = parseLinkPurifierRules;"
        + "\nthis.purify = purifyTrackedUrl;"
        + "\nthis.unwrap = unwrapForumJump;",
        context
    );
    const rules = context.parseRules(`
        @tracking = utm_*, fbclid
        * >> @tracking
        ~github.com >> utm_source
        *.amazon.com >> /\\/ref=[^\\/]+/
    `);
    const cleaned = context.purify("https://example.com/page?utm_source=forum&utm_medium=post&keep=1#part?fbclid=x&ok=2", rules);
    assert.equal(cleaned.url, "https://example.com/page?keep=1#part?ok=2");
    assert.deepEqual([...cleaned.removed], ["utm_source", "utm_medium", "fbclid"]);

    const allowed = context.purify("https://github.com/openai/codex?utm_source=forum&keep=1", rules);
    assert.equal(allowed.url, "https://github.com/openai/codex?utm_source=forum&keep=1");

    const pathCleaned = context.purify("https://www.amazon.com/item/ref=abc123/details?keep=1", rules);
    assert.equal(pathCleaned.url, "https://www.amazon.com/item/details?keep=1");

    const target = "https://example.com/path?utm_source=forum";
    const jump = `https://www.nodeseek.com/jump?to=${encodeURIComponent(target)}`;
    assert.deepEqual(
        JSON.parse(JSON.stringify(context.unwrap(jump, "https://www.nodeseek.com"))),
        { url: target, changed: true }
    );
}

assert.match(source, /comment_footprint:\s*\{\s*enabled:\s*false/);
assert.match(source, /resolve_short:\s*false/);
assert.match(source, /rules_compliance\.enabled/);
assert.match(source, /image_upload:\s*\{\s*enabled:\s*true,\s*active:\s*"NodeImage"/);
assert.match(source, /const externalImageUpload = \{/);
assert.match(source, /bindAppendedAvatars\(doc, pageConfig\)/);
assert.match(source, /typeof m\.match === "function" \? Boolean\(m\.match\(ctx\)\) : true/);

console.log("imported feature behavior: all tests passed");
