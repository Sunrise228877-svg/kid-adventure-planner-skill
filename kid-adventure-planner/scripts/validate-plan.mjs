#!/usr/bin/env node

import fs from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/validate-plan.mjs planner-config.json");
  process.exit(2);
}

let config;
try {
  config = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (error) {
  console.error(`ERROR: cannot read valid JSON: ${error.message}`);
  process.exit(2);
}

const errors = [];
const warnings = [];
const isDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value ?? "") && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const isTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value ?? "");
const minutes = (value) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
const integerAtLeast = (value, min) => Number.isInteger(value) && value >= min;

if (config?.version !== 1) errors.push("version must be 1");
const meta = config?.meta ?? {};
if (!meta.title) errors.push("meta.title is required");
if (!meta.childNickname) errors.push("meta.childNickname is required");
if (!isDate(meta.startDate) || !isDate(meta.endDate) || meta.startDate > meta.endDate) {
  errors.push("meta.startDate/endDate must be valid inclusive ISO dates");
}
try {
  new Intl.DateTimeFormat("en", { timeZone: meta.timezone }).format();
} catch {
  errors.push("meta.timezone must be a valid IANA timezone");
}

const calendar = Array.isArray(config?.calendar) ? config.calendar : [];
if (!calendar.length) errors.push("calendar must contain at least one day");
const dayTypes = new Set(["normal", "family", "travel", "rest"]);
const taskKinds = new Set(["fixed", "timer", "optional", "info"]);
const periods = new Set(["morning", "afternoon", "evening"]);
const dates = new Set();
const taskIds = new Set();
const taskCopies = new Map();
const weeklyIncome = new Map();
let totalXp = 0;
let totalCurrency = 0;

for (const day of calendar) {
  if (!isDate(day?.date)) {
    errors.push(`invalid calendar date: ${day?.date}`);
    continue;
  }
  if (dates.has(day.date)) errors.push(`duplicate calendar date: ${day.date}`);
  dates.add(day.date);
  if (!dayTypes.has(day.dayType)) errors.push(`${day.date}: invalid dayType`);
  const tasks = Array.isArray(day.tasks) ? day.tasks : [];
  for (const task of tasks) {
    const label = `${day.date}/${task?.id ?? "missing-id"}`;
    if (!task?.id || taskIds.has(task.id)) errors.push(`${label}: task id must be present and globally unique`);
    if (task?.id) taskIds.add(task.id);
    if (!taskKinds.has(task?.kind)) errors.push(`${label}: invalid kind`);
    if (!periods.has(task?.period)) errors.push(`${label}: invalid period`);
    if (!task?.title) errors.push(`${label}: title is required`);
    const reward = task?.reward ?? {};
    if (!integerAtLeast(reward.xp, 0) || !integerAtLeast(reward.currency, 0)) {
      errors.push(`${label}: reward xp/currency must be non-negative integers`);
    }
    if (["family", "travel", "rest"].includes(day.dayType) || task?.kind === "info") {
      if ((reward.xp ?? 0) !== 0 || (reward.currency ?? 0) !== 0) {
        errors.push(`${label}: informational/family/travel/rest entries cannot mint rewards`);
      }
    }
    if (task?.kind === "fixed") {
      if (!isTime(task.start) || !isTime(task.end) || minutes(task.end) <= minutes(task.start)) {
        errors.push(`${label}: fixed task needs valid start/end with end after start`);
      }
    }
    if (task?.kind === "timer" && !integerAtLeast(task.durationMinutes, 1)) {
      errors.push(`${label}: timer task needs positive integer durationMinutes`);
    }
    const copy = String(task?.copy ?? "").trim();
    if (!copy) warnings.push(`${label}: child-facing copy is missing`);
    if (copy.length > 90) warnings.push(`${label}: child-facing copy may be too long`);
    if (copy) taskCopies.set(copy, (taskCopies.get(copy) ?? 0) + 1);
    totalXp += reward.xp ?? 0;
    totalCurrency += reward.currency ?? 0;
    const startOrdinal = Date.parse(`${meta.startDate}T00:00:00Z`);
    const dayOrdinal = Date.parse(`${day.date}T00:00:00Z`);
    const week = Math.floor((dayOrdinal - startOrdinal) / 604800000) + 1;
    const income = weeklyIncome.get(week) ?? { xp: 0, currency: 0 };
    income.xp += reward.xp ?? 0;
    income.currency += reward.currency ?? 0;
    weeklyIncome.set(week, income);
  }
}

if (isDate(meta.startDate) && isDate(meta.endDate)) {
  for (let t = Date.parse(`${meta.startDate}T00:00:00Z`); t <= Date.parse(`${meta.endDate}T00:00:00Z`); t += 86400000) {
    const date = new Date(t).toISOString().slice(0, 10);
    if (!dates.has(date)) errors.push(`calendar is missing date ${date}`);
  }
  for (const date of dates) {
    if (date < meta.startDate || date > meta.endDate) warnings.push(`calendar date ${date} is outside the configured range`);
  }
}

for (const [copy, count] of taskCopies) {
  if (count > 1) warnings.push(`child-facing copy repeats ${count} times: ${copy}`);
}

const economy = config?.economy ?? {};
if (!integerAtLeast(economy.xpPerLevel, 1)) errors.push("economy.xpPerLevel must be a positive integer");
if (!integerAtLeast(economy.maxLevel, 1)) errors.push("economy.maxLevel must be a positive integer");
const itemIds = new Set();
let totalShopCost = 0;
for (const item of [...(economy.weeklyItems ?? []), ...(economy.hiddenItems ?? [])]) {
  if (!item?.id || itemIds.has(item.id)) errors.push(`shop item id must be present and unique: ${item?.id}`);
  if (item?.id) itemIds.add(item.id);
  if (!integerAtLeast(item?.cost, 1)) errors.push(`${item?.id ?? "shop item"}: cost must be a positive integer`);
  totalShopCost += Number(item?.cost ?? 0);
}
for (const item of economy.weeklyItems ?? []) {
  const income = weeklyIncome.get(item.week)?.currency ?? 0;
  if (income < item.cost) warnings.push(`${item.id}: week ${item.week} maximum income ${income} is below item cost ${item.cost}`);
}
if (totalShopCost > totalCurrency) warnings.push(`all shop items cost ${totalShopCost}, above theoretical income ${totalCurrency}`);

const avatarIds = new Set();
for (const avatar of config?.avatars ?? []) {
  if (!avatar?.id || avatarIds.has(avatar.id)) errors.push(`avatar id must be present and unique: ${avatar?.id}`);
  if (avatar?.id) avatarIds.add(avatar.id);
}
const stageLevels = new Set((config?.avatarStages ?? []).map((stage) => stage?.level));
if (integerAtLeast(economy.maxLevel, 1)) {
  for (let level = 1; level <= economy.maxLevel; level += 1) {
    if (!stageLevels.has(level)) errors.push(`avatarStages is missing level ${level}`);
  }
}

console.log(`Planner audit: ${calendar.length} days, ${taskIds.size} tasks`);
console.log(`Theoretical rewards: ${totalXp} XP, ${totalCurrency} currency`);
for (const [week, income] of [...weeklyIncome.entries()].sort((a, b) => a[0] - b[0])) {
  console.log(`Week ${week}: ${income.xp} XP, ${income.currency} currency`);
}
for (const warning of warnings) console.warn(`WARNING: ${warning}`);
for (const error of errors) console.error(`ERROR: ${error}`);

process.exit(errors.length ? 1 : 0);
