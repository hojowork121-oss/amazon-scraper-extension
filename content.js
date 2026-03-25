chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.action === "extractAmazon") {

    const items = document.querySelectorAll('[data-component-type="s-search-result"]');

    const rows = [["商品名", "価格", "評価", "レビュー数", "URL"]];

    items.forEach(item => {

      // 広告除外
      if (item.innerText.includes("スポンサー")) return;

      // 商品名
      const name = item.querySelector('h2 span')?.innerText?.trim() || "";

      // URL（複数対応）
      let link =
        item.querySelector('h2 a')?.href ||
        item.querySelector('a[href*="/dp/"]')?.href ||
        "";

      if (link && link.startsWith('/')) {
        link = "https://www.amazon.co.jp" + link;
      }

      // 価格
      let priceText = item.querySelector('.a-price')?.innerText || "";

      // 改行除去（重複対策）
      priceText = priceText.split('\n')[0];

      // ￥とカンマ削除 → 数値化
      const price = priceText.replace(/[^\d]/g, "");

      // 評価
      let ratingText = item.querySelector('.a-icon-alt')?.innerText || "";

      // 日本語部分削除
      const rating = ratingText.replace("5つ星のうち", "").trim();

      // レビュー（誤爆防止版）
      let review = "";

      const ratingEl = item.querySelector('.a-icon-alt');

      if (ratingEl) {
        const reviewEl = ratingEl.closest('div')?.querySelector('.s-underline-text');

        if (reviewEl && reviewEl.innerText.match(/\d+/)) {
          review = reviewEl.innerText.replace(/[^0-9]/g, "");
        }
      }

      if (name && link) {
        rows.push([
          name.replace(/"/g, '""'),
          price,
          rating,
          review,
          link
        ]);
      }
    });

    // CSV生成
    const csv = rows.map(row =>
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    sendResponse({ csv });
  }

  return true;
});