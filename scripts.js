const DB_NAME = 'PHANTOM_BOOKMARKS_00';
const OBJECT_STORE_NAME = 'bookmarks';
const links = [];
let DB;
let currentPage = 0;

/**
 * add event listeners and loads bookmarks
 */
function setup() {
  console.log('setup');
  initializeDatabase();
  document.querySelector('input#url').addEventListener('keyup', validateURL);
  document.querySelector('.submit-link-form > form').addEventListener('submit', addLink);
}

function read() {
  const transaction = DB.transaction(['bookmark']);
  const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
  const request = objectStore.get(1);

  request.onerror = event => {
    console.log('Transaction failed');
  };

  request.onsuccess = event => {
    if (request.result) {
      console.log(request.result);
    } else {
      console.log('No data record');
    }
  };
}

/**
 * open the database
 */
function initializeDatabase() {
  // https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
  window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers
  window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
  if (!window.indexedDB) {
    alert("I'm sorry, your browser doesn't support a stable version of IndexedDB. This application won't work 😟");
  }

  const request = window.indexedDB.open(DB_NAME, 1);
  request.onerror = event => {
    console.error(event);
    alert('Something went wrong while loading the database. Please reload.');
  };
  request.onsuccess = event => {
    console.info(event);
    DB = request.result;
    console.info('Database opened successfully');
    let objectStore;
    if (!DB.objectStoreNames.contains(OBJECT_STORE_NAME)) {
      objectStore = DB.createObjectStore(OBJECT_STORE_NAME, {autoIncrement: true});
      objectStore.createIndex('url', 'url', {unique: false});
    }
    read();
  };
  request.onupgradeneeded = event => {
    console.info(event);
    DB = event.target.result;
    console.info('Database opened through `onupgradeneeded`');

    let objectStore;
    if (!DB.objectStoreNames.contains(OBJECT_STORE_NAME)) {
      objectStore = DB.createObjectStore(OBJECT_STORE_NAME, {autoIncrement: true});
      objectStore.createIndex('url', 'url', {unique: false});
      objectStore.transaction.oncomplete = event => {
        const bookmarkObjectStore = DB.transaction(OBJECT_STORE_NAME, 'readwrite').objectStore(OBJECT_STORE_NAME)
      }
    }
    // loadPersistedBookmarks();
    // read();
  };
}

/**
 * loads bookmarks from persistent storage
 */
function loadPersistedBookmarks() {
  console.log('loading bookmarks');

  // read();
  renderLinks();
  renderPagination();
}

/**
 * save bookmarks to persistent storage
 */
function persistBookmarks() {
}

/**
 * Validate link through a RegExp, then check if the URL exists
 * @param url
 * @returns {Promise<void>}
 */
async function validateURL({target: {value: url}}) {
  // https://stackoverflow.com/a/9284473/6174480
  const validUrlRegExp = new RegExp('^(?:(?:https?|ftp):\\/\\/)(?:\\S+(?::\\S*)?@)?(?:(?!(?:10|127)(?:\\.\\d{1,3}){3})(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\\.(?:[a-z\u00a1-\uffff]{2,}))\\.?)(?::\\d{2,5})?(?:[/?#]\\S*)?$', 'i');
  const saveLinkButton = document.querySelector('.submit-link-form form button');
  const invalidUrlError = document.querySelector('.invalid-url-error');

  // check validity through regexp,
  // then attempt a request to see if url exists
  if (url.match(validUrlRegExp)) {
    try {
      const response = await fetch(url);
      if (await response.status >= 400)
        throw new Error();

      invalidUrlError.style.display = 'none';
      saveLinkButton.classList.remove('disabled');
    } catch (e) {
      invalidUrlError.style.display = 'block';
      saveLinkButton.classList.add('disabled');
    }
  } else {
    invalidUrlError.style.display = 'block';
    saveLinkButton.classList.add('disabled');
  }
}

/**
 * append a link to saved bookmarks
 * @param event
 * @returns {boolean}
 */
async function addLink(event) {
  event.preventDefault();

  const url = document.querySelector('input#url').value;
  console.log(url);

  links.push(url);

  const request = DB.transaction(['bookmark'], 'readwrite')
    .objectStore(OBJECT_STORE_NAME)
    .add({url: 'https://phantom.land'});

  request.onsuccess = event => {
    console.info('The data has been written successfully');
  };

  request.onerror = event => {
    console.warning('The data has been written failed');
  };

  // TODO: display confirmation page
  renderLinks();
  return false;
}

// TODO: editLink (replace with input field)
function editLink() {
}

// TODO: updateLink (update in list)
function updateLink() {
}

// TODO: deleteLink (delete from list)
function deleteLink() {
}

// TODO: include pagination
// render a bookmark page
function renderLinks() {
  const links = [
    {url: 'https://phantom.land', key: 0},
    {url: 'https://google.com', key: 1},
    {url: 'https://twitter.com', key: 2},
    {url: 'https://facebook.com', key: 3}
  ];

  const bookmarkList = document.querySelector('.bookmark-list > ul');

  [...links, ...links, ...links, ...links, ...links, ...links, ...links, ...links]
    .forEach(link => {
      const listElement = document.createElement('li');
      const anchor = document.createElement('a');
      const text = document.createTextNode(link.url);

      anchor.title = link.url;
      anchor.href = link.url;
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('data-key', 1);
      anchor.appendChild(text); // text into <a>

      listElement.classList.add('bookmark');
      listElement.appendChild(anchor); // <a> into <li>

      bookmarkList.appendChild(listElement); // <li> into <ul>
    });

}

//TODO: render new pagination
function renderPagination() {
}
