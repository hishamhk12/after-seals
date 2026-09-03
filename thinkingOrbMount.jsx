import React from "react";
import { createRoot } from "react-dom/client";
import { ThinkingOrb } from "thinking-orbs";

let root = null;
let mountedNode = null;

function mountThinkingOrb(target) {
  if (!target) {
    return;
  }

  if (root && mountedNode === target) {
    return;
  }

  unmountThinkingOrb();
  mountedNode = target;
  root = createRoot(target);
  root.render(<ThinkingOrb state="solving" size={64} theme="light" />);
}

function unmountThinkingOrb() {
  if (root) {
    root.unmount();
  }

  root = null;
  mountedNode = null;
}

window.ThinkingOrbMount = {
  mount: mountThinkingOrb,
  unmount: unmountThinkingOrb,
};
