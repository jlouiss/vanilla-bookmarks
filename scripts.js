const pagination = {
  totalBookmarks: 0,
  currentPage: 0,
  start: 0,
  limit: 20
};

/**
 * add event listeners and loads bookmarks
 */
function setup() {
  console.log('setup');
  initializeDatabase(renderBookmarks);
  document.querySelector('input#url').addEventListener('keyup', validateURL);
  document.querySelector('.submit-link-form > form').addEventListener('submit', addLink);
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
function addLink(event) {
  event.preventDefault();
  // TODO: display confirmation page
  const url = document.querySelector('input#url').value;
  const name = document.querySelector('input#name').value;
  const request = window.indexedDB.open(DB_NAME, 1);

  request.onerror = console.error;
  request.onsuccess = event => {
    const DB = request.result;
    const transaction = DB.transaction(OBJECT_STORE_NAME, 'readwrite');
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
    const index = objectStore.index('name');

    DB.onerror = console.error;

    objectStore.put({url, name});
    transaction.oncomplete = DB.close;
    renderBookmarks();
    resetForm();
  };

  return false;
}

/**
 * reset form inputs
 */
function resetForm() {
  document.querySelectorAll('.submit-link-form form input').forEach(input => input.value = '');
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
/**
 * get bookmarks from database and render
 */
function renderBookmarks() {
  const request = window.indexedDB.open(DB_NAME, 1);
  request.onerror = console.error;
  request.onsuccess = event => {
    const DB = request.result;
    const transaction = DB.transaction(OBJECT_STORE_NAME, 'readwrite');
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
    const readRequest = objectStore.getAll();

    readRequest.onerror = console.error;
    readRequest.onsuccess = () => renderLinks(readRequest.result)
  };
}

/**
 * visualize links in application
 * @param links
 * @param page
 */
function renderLinks(links, page = pagination.currentPage) {
  pagination.totalBookmarks = links.length;
  const lowerBound = page * pagination.limit;
  const upperBound = (page + 1) * pagination.limit;
  const bookmarkList = document.querySelector('.bookmark-list > ul');
  bookmarkList.innerHTML = ''; // clean list

  // render links
  links.slice(lowerBound, upperBound)
    .forEach(link => {
      const listElement = document.createElement('li');
      const anchor = document.createElement('a');
      const name = document.createTextNode(`${link.name} - `);
      const text = document.createTextNode(link.url);

      anchor.title = link.url;
      anchor.href = link.url;
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('data-key', link.id);
      listElement.classList.add('bookmark');

      anchor.appendChild(text); // text into <a>
      listElement.appendChild(name); // text into <li>
      listElement.appendChild(anchor); // <a> into <li>
      bookmarkList.appendChild(listElement); // <li> into <ul>
    });

  renderPagination();
}

/**
 * update pagination
 */
function renderPagination() {
  const prev = document.querySelector('.page-nav.prev');
  const next = document.querySelector('.page-nav.next');
  const numberOfPages = Math.ceil(pagination.totalBookmarks / pagination.limit);

  // disable navigation when there are no other pages
  if (numberOfPages === 1) {
    prev.classList.add('disabled');
    next.classList.add('disabled');
  }
  else {
    prev.classList.remove('disabled');
    next.classList.remove('disabled');
  }

  // disable next if there are no more pages
  if (pagination.currentPage === numberOfPages - 1)
    next.classList.add('disabled');
  else
    next.classList.remove('disabled');

  // disable previous if you're on the first page
  if (pagination.currentPage === 0)
    prev.classList.add('disabled');
  else
    prev.classList.remove('disabled');

  // render pages
  const pageList = document.querySelector('.pagination > .pages');
  pageList.innerHTML = ''; // empty list
  for (let i = 0; i < numberOfPages - 1; i++) {
    const page = document.createElement('a');
    const text = document.createTextNode(i);
    page.classList.add('page-nav');

    if (i === pagination.currentPage)
      page.classList.add('current');

    page.appendChild(text);
    pageList.append(page);
  }
}

// TODO: render previous page
function renderPreviousPage() {

}

// TODO: render next page
function renderNextPage() {

}
