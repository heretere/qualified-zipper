//listen for when extension button is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting
    .executeScript({
      target: { tabId: tab.id },
      files: ["foreground.js"],
    })
    .then(() => console.log("Finished zipping"));
});

//listener for a message that comes from foreground.js
//this tells Qualified Zipper to download the zipped file
chrome.runtime.onMessage.addListener(({ url, filename }) => {
  if (filename.endsWith(".zip")) {
    chrome.downloads.download({
      url,
      filename: filename ? filename : undefined,
    });
  } else {
    chrome.downloads.download({
      url,
      filename: filename ? filename + ".zip" : undefined,
    });
  }
});
