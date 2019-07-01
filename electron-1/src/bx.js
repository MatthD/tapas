'use strict';

const { ipcRenderer } = require('electron');
const uuid = require('uuid/v1');

const bx = {
  /**
   * Generic promise gen to dialog with main/parent process
   * @param {string} info | info aboout app to get [name,version..]
   */
  getInfos(info) {
    return new Promise((resolve, reject) => {
      // Uniq ID from timestamp so that main answer to the correct event listener
      let id = uuid(); 
      ipcRenderer.send('getAppInfo', info, id);
      ipcRenderer.on(`${info}-${id}`, function handler(response, result){
        // We need to remove listener to prevent multiple listener of same type
        ipcRenderer.removeListener(info, handler);
        // Main has not any info about, just stop here
        if (!result) return reject('Asked a non defined app infos');
        resolve(result);
      });
    })
  },
  getVersion() {
    return this.getInfos('version');
  },
  getName() {
    return this.getInfos('name');
  }
};

// Freeze bx because it should be read only
module.exports.bx = Object.freeze(bx);