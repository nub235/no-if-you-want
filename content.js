(() => {
  const PROCESSED_ATTR = "data-nyw-processed";

  function removeIfYouWant(root) {
    root.querySelectorAll("hr").forEach((hr) => {
      let next = hr.nextElementSibling;
      while (next) {
        const text = (next.textContent || "").toLowerCase();
        if (text.includes("if you want")) {
          hr.remove();
          next.remove();
          return;
        }
        if ((next.textContent || "").trim().length > 0) break;
        next = next.nextElementSibling;
      }
    });

    root.querySelectorAll("p, div, span").forEach((el) => {
      const text = (el.textContent || "").trim();
      if (text.toLowerCase().startsWith("if you want")) {
        const prev = el.previousElementSibling;
        if (prev && prev.tagName === "HR") prev.remove();
        el.remove();
      }
    });

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) textNodes.push(node);

    for (const textNode of textNodes) {
      const text = textNode.textContent;
      if (!text.toLowerCase().includes("if you want")) continue;

      const pattern = /(?:^|[.!?]\s+)If you want[^.!?]*[.!?]?/gi;
      let modified = text;
      let match;
      while ((match = pattern.exec(modified)) !== null) {
        modified = modified.slice(0, match.index) + modified.slice(match.index + match[0].length);
        pattern.lastIndex = 0;
      }

      if (modified !== text) {
        textNode.textContent = modified.replace(/\s+/g, " ").trim();
      }
    }
  }

  function processMessages() {
    const messages = document.querySelectorAll(`[data-message-author-role="assistant"]:not([${PROCESSED_ATTR}])`);
    messages.forEach((msg) => {
      msg.setAttribute(PROCESSED_ATTR, "true");
      const content = msg.querySelector(".markdown") || msg.querySelector(".prose") || msg;
      removeIfYouWant(content);
    });
  }

  processMessages();

  const observer = new MutationObserver(() => processMessages());
  observer.observe(document.body, { childList: true, subtree: true });
})();