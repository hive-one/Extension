export class CustomCache {
  async get(key) {
    return new Promise(resolve => {
      chrome.storage.local.get([key], result => {
        resolve(result[key]);
      });
    });
  }

  async save(key, value) {
    return new Promise(resolve => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve();
      });
    });
  }

  clear() {
    chrome.storage.local.clear();
  }
}
