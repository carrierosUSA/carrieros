import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const layout=readFileSync("app/layout.tsx","utf8");
const sidebar=readFileSync("components/Sidebar.tsx","utf8");
const css=readFileSync("app/globals.css","utf8");

test("global keyboard users can bypass repeated navigation",()=>{
  assert.match(layout,/href="#main-content"/);
  assert.match(layout,/>Skip to main content</);
  assert.match(layout,/id="main-content" tabIndex=\{-1\}/);
  assert.match(css,/\.skip-link:focus-visible/);
});

test("mobile navigation is focus-safe and keyboard dismissible",()=>{
  assert.match(sidebar,/aria-controls="primary-sidebar"/);
  assert.match(sidebar,/id="primary-sidebar"/);
  assert.match(sidebar,/event\.key === "Escape"/);
  assert.match(sidebar,/menuButton\.current\?\.focus\(\)/);
  assert.match(sidebar,/invisible -translate-x-full/);
  assert.match(sidebar,/lg:visible lg:translate-x-0/);
});

test("navigation state and motion preferences are exposed accessibly",()=>{
  assert.match(sidebar,/aria-current=\{active \? "page"/);
  assert.match(sidebar,/aria-labelledby=\{labelId\}/);
  assert.match(css,/@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css,/animation-duration: 0\.01ms !important/);
  assert.match(css,/transition-duration: 0\.01ms !important/);
});
