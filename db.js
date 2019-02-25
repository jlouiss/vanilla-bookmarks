const DB_NAME = 'PhantomBookmarks';
const DB_VERSION = 1;
const OBJECT_STORE_NAME = 'Bookmarks';

/**
 * initialize the database and object store
 * @callback cb
 */
function initializeDatabase(cb = () => {
}) {
  // https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
  window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers
  window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
  if (!window.indexedDB) {
    alert('I\'m sorry, your browser doesn\'t support a stable version of IndexedDB. This application won\'t work 😟');
  }

  const request = window.indexedDB.open(DB_NAME, DB_VERSION);
  request.onerror = function (event) {
    console.error(event);
    alert('Something went wrong while loading the database. Please reload.');
  };

  request.onsuccess = function (event) {
    console.info(event);
    // populate();
    cb();
  };

  request.onupgradeneeded = function (event) {
    console.info(event);

    // first time:
    const DB = request.result;
    const store = DB.createObjectStore(OBJECT_STORE_NAME, {autoIncrement: true});
    store.createIndex('name', 'name', {unique: false});
    // populate();
    cb();
  };
}

/**
 * add fake bookmarks for testing purpose
 */
function populate() {
  const bookmarks = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz'.split('').map((letter) => ({
    name: letter,
    url: `https://google.com/${letter}`,
  }));
  const request = window.indexedDB.open(DB_NAME, DB_VERSION);
  request.onerror = console.error;
  request.onsuccess = () => {
    const db = request.result;
    const transaction = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(OBJECT_STORE_NAME);
    db.onerror = console.error;
    transaction.oncomplete = db.close;
    bookmarks.forEach((b) => store.put(b));
  };
}
