document.getElementById('amazon').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, { action: "extractAmazon" }, (response) => {

    if (!response || !response.csv) {
      alert("データ取得に失敗しました");
      return;
    }

    downloadWithBOM(response.csv, "amazon_", ".csv");
  });
});


// CSVダウンロード（BOM付き）
function downloadWithBOM(text, prefix, extension) {
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const encoder = new TextEncoder();
  const utf8Array = encoder.encode(text);

  const combined = new Uint8Array(bom.length + utf8Array.length);
  combined.set(bom, 0);
  combined.set(utf8Array, bom.length);

  const blob = new Blob([combined], {
    type: 'text/csv;charset=utf-8'
  });

  const url = URL.createObjectURL(blob);

  chrome.downloads.download({
    url: url,
    filename: prefix + new Date().toISOString().slice(0, 10) + extension,
    saveAs: true
  });
}