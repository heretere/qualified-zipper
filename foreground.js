(async () => {
  //Check if zip reference has been defined
  //If not page refresh is needed
  if (typeof zip === "undefined") {
    alert("Refresh page to use Qualified Zipper");
    return;
  }

  //create zip file system
  const fs = new zip.fs.FS();

  //sleep utility method to make sure text content is loaded
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  //closes all qualified tabs to make process simpler programmatically
  const resetState = async () => {
    document.querySelectorAll('button[class="close"]').forEach((element) => {
      element.click();
    });
  };

  //inital reset state to create a base state
  await resetState();

  //Find all files in the file selection bar
  const elements = document
    .querySelector('file-tree[files="$ctrl.files"]')
    .querySelectorAll(
      'span[ng-click="$ctrl.handleClick($event, fileRow)"][role="button"]'
    );

  for (let element of elements) {
    //retrieve the file path from the tooltip on each button
    const filePath = element
      .querySelector("span[tooltip]")
      .getAttribute("tooltip")
      .trim();

    //click the element to run it's javascript event
    element.click();

    //Find the tab that the button click should have opened
    const tab = document.querySelector(`tab-heading[tooltip^="${filePath}"]`);

    //if the tab was found add text to zip
    if (tab) {
      //Click the tab so it's visible
      tab.parentElement.click();

      //Sleep for 50ms to make sure text is loaded
      await sleep(50);

      //Sanitizes the innerText attribute as it has some elements that we don't need
      fs.addText(
        filePath,
        document
          .querySelector("div.CodeMirror-lines")
          .innerText.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "")
          .split("\n")
          .filter((line) => !/^\d+$/.test(line))
          .join("\n")
      );
    }

    await resetState();
  }

  //Ask for file name
  const filename = prompt("Pick name for project");

  //export a blob url so it can be downloaded
  //then send a message so service-worker.js can execute the download
  fs.exportBlob()
    .then(URL.createObjectURL)
    .then((url) => chrome.runtime.sendMessage({ url, filename }));
})();
