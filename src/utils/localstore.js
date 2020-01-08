export const storageset = (kv) => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.set(kv, function() {
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
};

export const storageget = (key) => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(key, function(value) {
        console.log(value);
        resolve(value);
      });
    } catch (e) {
      reject(e);
    }
  });
};

export const getItem = (key) => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(key, function(result) {
        console.log(result[key]);
        resolve(result[key]);
      });
    } catch (e) {
      reject(e);
    }
  });
};

export const storageremove = (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.remove(key, function(value) {
      resolve(value);
    });
  });
};

export const storageclear = (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.clear(key, function(value) {
      resolve(value);
    });
  });
};

const storage = {
  set: storageset,
  get: storageget,
  getItem,
  remove: storageremove,
  storageclear: storageclear,
};

export default storage;