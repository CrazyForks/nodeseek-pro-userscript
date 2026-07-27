const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("Nodeseek Pro.user.js", "utf8");
const startMarker = "/* LOTTERY_NOTIFICATION_STATE_START */";
const endMarker = "/* LOTTERY_NOTIFICATION_STATE_END */";
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker);

assert.notEqual(start, -1, "missing lottery notification state start marker");
assert.notEqual(end, -1, "missing lottery notification state end marker");
assert.ok(end > start, "lottery notification state markers are out of order");

const context = {};
vm.runInNewContext(
    source.slice(start + startMarker.length, end)
        + "\nthis.notificationRetryDelay = notificationRetryDelay;"
        + "\nthis.canAttemptNotification = canAttemptNotification;"
        + "\nthis.summarizeNotificationDelivery = summarizeNotificationDelivery;"
        + "\nthis.recordNotificationDelivery = recordNotificationDelivery;",
    context
);

const {
    notificationRetryDelay,
    canAttemptNotification,
    summarizeNotificationDelivery,
    recordNotificationDelivery
} = context;

const success = summarizeNotificationDelivery(
    ["Telegram"],
    [{ status: "fulfilled", value: undefined }]
);
assert.equal(success.ok, true);
assert.deepEqual([...success.succeeded], ["Telegram"]);
assert.deepEqual([...success.failed], []);

const failure = summarizeNotificationDelivery(
    ["Telegram"],
    [{ status: "rejected", reason: new Error("HTTP 400") }]
);
assert.equal(failure.ok, false);
assert.deepEqual([...failure.succeeded], []);
assert.equal(failure.failed.length, 1);
assert.equal(failure.failed[0].channel, "Telegram");
assert.equal(failure.failed[0].message, "HTTP 400");

const localOnly = summarizeNotificationDelivery([], []);
assert.equal(localOnly.ok, true, "desktop-only notifications should complete");

const reminder = {};
const firstAttemptAt = Date.parse("2026-07-27T12:00:00.000Z");
assert.equal(recordNotificationDelivery(reminder, "result", failure, firstAttemptAt), false);
assert.equal(reminder.resultNotified, false);
assert.equal(reminder.resultNotifyAttempts, 1);
assert.equal(reminder.resultNotifyLastAttemptAt, firstAttemptAt);
assert.match(reminder.resultNotifyLastError, /Telegram: HTTP 400/);

assert.equal(canAttemptNotification(reminder, "result", firstAttemptAt + 59_999), false);
assert.equal(canAttemptNotification(reminder, "result", firstAttemptAt + 60_000), true);
assert.equal(notificationRetryDelay(1), 60_000);
assert.equal(notificationRetryDelay(2), 120_000);
assert.equal(notificationRetryDelay(10), 15 * 60_000);

const secondAttemptAt = firstAttemptAt + 60_000;
assert.equal(recordNotificationDelivery(reminder, "result", success, secondAttemptAt), true);
assert.equal(reminder.resultNotified, true);
assert.equal(reminder.resultNotifyAttempts, 2);
assert.equal(reminder.resultNotifyLastAttemptAt, secondAttemptAt);
assert.equal(reminder.resultNotifyLastError, undefined);
assert.equal(canAttemptNotification(reminder, "result", secondAttemptAt + 60_000), false);

console.log("lottery notification state: all tests passed");
