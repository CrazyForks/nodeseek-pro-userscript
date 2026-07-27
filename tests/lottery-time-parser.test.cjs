const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("Nodeseek Pro.user.js", "utf8");
const startMarker = "/* LOTTERY_TIME_PARSER_START */";
const endMarker = "/* LOTTERY_TIME_PARSER_END */";
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker);

assert.notEqual(start, -1, "missing lottery time parser start marker");
assert.notEqual(end, -1, "missing lottery time parser end marker");
assert.ok(end > start, "lottery time parser markers are out of order");

const context = {};
vm.runInNewContext(
    source.slice(start + startMarker.length, end) + "\nthis.parseLotteryDrawTime = parseLotteryDrawTime;",
    context
);

const parse = context.parseLotteryDrawTime;
const now = Date.parse("2026-07-27T04:00:00.000Z");
const cases = [
    ["开奖时间为7.30 晚8点 之前抽奖", "2026-07-30T12:00:00.000Z"],
    ["开奖时间：2026年7月30日20:15", "2026-07-30T12:15:00.000Z"],
    ["7月30日晚上8点半开奖", "2026-07-30T12:30:00.000Z"],
    ["今晚20:00开奖", "2026-07-27T12:00:00.000Z"],
    ["明天晚上8点开奖", "2026-07-28T12:00:00.000Z"],
    ["后天上午9点开奖", "2026-07-29T01:00:00.000Z"],
    ["晚8点 7月30日开奖", "2026-07-30T12:00:00.000Z"]
];

for (const [text, expected] of cases) {
    assert.equal(new Date(parse(text, now)).toISOString(), expected, text);
}

assert.equal(parse("开奖时间待定", now), null);
assert.equal(parse("优惠价格 7.30 元，晚上8点发布", now), null);
assert.equal(parse("这不是抽奖，7.30 晚8点发布", now), null);
assert.equal(parse("开奖时间为2.30 晚8点", now), null);
assert.equal(
    new Date(parse("1.2 晚8点开奖", Date.parse("2026-12-30T04:00:00.000Z"))).toISOString(),
    "2027-01-02T12:00:00.000Z"
);

console.log("lottery time parser: all tests passed");
