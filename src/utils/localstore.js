export const _set = (kv) => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.set(kv, resolve);
    } catch (e) {
      reject(e);
    }
  });
};

export const _get = (key) => {
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

export const nsstorage = (item) => {
  return {
    set (kv) {
      return new Promise((resolve, reject) => {
        try {
          chrome.storage.sync.set({
            [item]: kv,
          }, resolve);
        } catch (e) {
          reject(e);
        }
      });
    },
    get (key) {
      return new Promise((resolve, reject) => {
        try {
          chrome.storage.sync.get(item, function(results) {
            const value = results[item];
            console.log('get collaction', results);
            console.log('get value', value);
            key ? resolve(value[key]) : resolve(value);
          });
        } catch (e) {
          reject(e);
        }
      });
    },
    clear () {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.clear(key, function(value) {
          resolve(value);
        });
      });
    },
    remove () {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.remove(key, function(value) {
          resolve(value);
        });
      });
    },
  };
};

export const remove = (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.remove(key, function(value) {
      resolve(value);
    });
  });
};

export const clear = (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.clear(key, function(value) {
      resolve(value);
    });
  });
};

const storage = {
  set: _set,
  get: _get,
  getItem,
  remove,
  clear,
  namespace: nsstorage,
};

export default storage;