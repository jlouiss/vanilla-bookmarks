const DB_NAME = 'PhantomBookmarks';
const OBJECT_STORE_NAME = 'Bookmarks';

/**
 * initialize the database and object store
 * @callback cb
 */
function initializeDatabase(cb = () => {}) {
  // https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
  window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers
  window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
  if (!window.indexedDB) {
    alert('I\'m sorry, your browser doesn\'t support a stable version of IndexedDB. This application won\'t work 😟');
  }

  const request = window.indexedDB.open(DB_NAME, 1);
  request.onerror = function (event) {
    console.error(event);
    alert('Something went wrong while loading the database. Please reload.');
  };

  request.onsuccess = function (event) {
    console.info(event);
    cb();
  };

  request.onupgradeneeded = function (event) {
    console.info(event);

    // first time:
    const DB = request.result;
    const store = DB.createObjectStore(OBJECT_STORE_NAME, {autoIncrement: true});
    store.createIndex('name', 'name', {unique: false});
    cb();
  };
}

