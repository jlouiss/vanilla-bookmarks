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
  initializeDatabase(renderBookmarks);
  document.querySelector('input#url').addEventListener('keyup', validateURL);
  document.querySelector('.submit-link-form > form').addEventListener('submit', addLink);
  document.querySelector('.pages').addEventListener('click', handlePageNavClick);
  document.querySelector('.bookmark-list > ul').addEventListener('click', handleBookmarkAction);
}

/**
 * Validate link through a RegExp, then check if the URL exists
 * @param url
 * @returns {Promise<void>}
 */
async function validateURL({target: {value: url}}) {
  // https://stackoverflow.com/a/9284473/6174480
  const validUrlRegExp = new RegExp('^(?:(?:https?|ftp):\\/\\/)(?:\\S+(?::\\S*)?@)?(?:(?!(?:10|127)(?:\\.\\d{1,3}){3})(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\\.(?:[a-z\u00a1-\uffff]{2,}))\\.?)(?::\\d{2,5})?(?:[/?#]\\S*)?$', 'i');
  const saveLinkButton = document.querySelector('.submit-link-form form button.submit');
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
  const url = document.querySelector('input#url').value;
  const name = document.querySelector('input#name').value;
  const request = window.indexedDB.open(DB_NAME, DB_VERSION);

  request.onerror = console.error;
  request.onsuccess = () => {
    const DB = request.result;
    const transaction = DB.transaction(OBJECT_STORE_NAME, 'readwrite');
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);

    DB.onerror = console.error;

    objectStore.put({url, name});
    transaction.oncomplete = DB.close;
    showConfirmation({ url, name });
    renderBookmarks();
    resetForm();
  };

  return false;
}

/**
 * show confirmation to user
 */
function showConfirmation({ url, name }) {
  const confirmation = document.querySelector('.link-addition-confirmation');
  const bookmarkOutlet = document.querySelector('.bookmark-outlet');

  const bookmarkText = document.createTextNode(`${name} - `);
  const bookmarkLink = document.createElement('a');
  const bookmarkLinkText = document.createTextNode(url);

  bookmarkLink.setAttribute('target', '_blank');
  bookmarkLink.setAttribute('href', url);
  bookmarkLink.appendChild(bookmarkLinkText);

  bookmarkOutlet.innerHTML = ''; // clean
  bookmarkOutlet.appendChild(bookmarkText);
  bookmarkOutlet.appendChild(bookmarkLink);

  confirmation.classList.remove('hidden');
}

/**
 * hide confirmation
 */
function closeConfirmation() {
  const confirmation = document.querySelector('.link-addition-confirmation');
  confirmation.style.opacity = '0';
  // timeout must match transition timing
  setTimeout(() => confirmation.classList.add('hidden'), 400);
}

/**
 * reset form inputs
 */
function resetForm() {
  document.querySelectorAll('.submit-link-form form input').forEach(input => input.value = '');
}

/**
 * call delete or edit according to target
 * @param event
 */
function handleBookmarkAction(event) {
  if (!event.target.classList.contains('delete') && !event.target.classList.contains('edit'))
    return;

  const key = parseInt(event.target.getAttribute('data-key'), 10);

  if (event.target.classList.contains('delete'))
    deleteByKey(key, () => renderBookmarks(pagination.currentPage));

  if (event.target.classList.contains('edit'))
    editLink(event.target.parentNode.querySelector('a'));
}

/**
 * populate form and change form action to update bookmark
 * @param bookmark
 */
function editLink(bookmark) {
  const key = bookmark.getAttribute('data-key');
  const url = bookmark.getAttribute('href');
  const name = bookmark.getAttribute('title');
  window.scrollTo(0, 0);

  const form = document.querySelector('.submit-link-form form');
  const formTitle = document.querySelector('.submit-link-form .title');
  const nameInput = document.querySelector('.submit-link-form input#name');
  const urlInput = document.querySelector('.submit-link-form input#url');
  const saveButton = document.querySelector('.submit-link-form form button');
  const updateButton = document.createElement('button');
  const cancelButton = document.createElement('button');

  // change form and hide save button
  formTitle.innerHTML = 'Update Link';
  nameInput.value = name;
  urlInput.value = url;
  saveButton.classList.add('hidden');

  // show update button
  updateButton.innerHTML = 'Update';
  updateButton.classList.add('update');
  updateButton.classList.add('submit'); // necessary for validateURL()
  updateButton.addEventListener('click', updateLink);
  form.appendChild(updateButton);

  // show cancel button
  cancelButton.innerHTML = 'Cancel';
  cancelButton.classList.add('cancel');
  cancelButton.addEventListener('click', cancelEdit);
  form.appendChild(cancelButton);

  /**
   * save link and re-render bookmarks
   */
  function updateLink() {
  }

  /**
   * restore form to "Add Link" and save button
   */
  function cancelEdit() {
    resetForm();
    formTitle.innerHTML = 'Add Link';
    cancelButton.parentElement.removeChild(cancelButton);
    updateButton.parentElement.removeChild(updateButton);
    submitButton.classList.remove('hidden');
  }
}

// TODO: updateLink (update in list)
function updateLink() {
}

/**
 * get bookmarks from database and render them in the application
 * @param pageNumber
 */
function renderBookmarks(pageNumber = pagination.currentPage) {
  readAll(bookmarks => renderLinks(bookmarks, pageNumber));
}

/**
 * visualize links in application according to page number
 * @param links
 * @param pageNumber
 */
function renderLinks(links, pageNumber) {
  pagination.totalBookmarks = links.length;
  pagination.currentPage = pageNumber;

  const lowerBound = pageNumber * pagination.limit;
  const upperBound = (pageNumber + 1) * pagination.limit;
  const bookmarkList = document.querySelector('.bookmark-list > ul');
  bookmarkList.innerHTML = ''; // clean list

  const generateLinkElement = (text, key) => {
    const anchor = document.createElement('a');
    anchor.appendChild(document.createTextNode(text));
    anchor.setAttribute('data-key', key);
    return anchor;
  };

  // render links
  links.slice(lowerBound, upperBound)
    .forEach(link => {
      const listElement = document.createElement('li');
      const name = document.createTextNode(`${link.name} - `);
      const anchor = generateLinkElement(link.url, link.key);
      const deleteLink = generateLinkElement('delete', link.key);
      const editLink = generateLinkElement('edit', link.key);

      anchor.setAttribute('title', link.name);
      anchor.setAttribute('href', link.url);
      anchor.setAttribute('target', '_blank');
      deleteLink.classList.add('delete');
      editLink.classList.add('edit');
      listElement.classList.add('bookmark');

      listElement.appendChild(name); // text into <li>
      listElement.appendChild(anchor); // <a> into <li>
      listElement.appendChild(document.createTextNode(' - ')); // separator into <li>
      listElement.appendChild(deleteLink); // add <a>delete</a> into <li>
      listElement.appendChild(document.createTextNode(' - ')); // separator into <li>
      listElement.appendChild(editLink); // add <a>edit</a> into <li>
      bookmarkList.appendChild(listElement); // <li> into <ul>
    });

  renderPagination();
}

/**
 * show next, previous and page numbers
 */
function renderPagination() {
  const prev = document.querySelector('.page-nav.prev');
  const next = document.querySelector('.page-nav.next');
  const numberOfPages = Math.ceil(pagination.totalBookmarks / pagination.limit);

  // disable navigation when there are no other pages
  if (numberOfPages === 1) {
    prev.classList.add('disabled');
    next.classList.add('disabled');
  } else {
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

  for (let i = 0; i < numberOfPages; i++) {
    const page = document.createElement('a');
    const text = document.createTextNode(`${i}`);
    page.classList.add('page-nav');
    page.setAttribute('data-page-number', `${i}`);

    if (i === pagination.currentPage)
      page.classList.add('current');

    page.appendChild(text);
    pageList.append(page);
  }
}

function handlePageNavClick(event) {
  if (!event.target.classList.contains('page-nav'))
    return;

  const pageNumber = parseInt(event.target.getAttribute('data-page-number'), 10);
  renderBookmarks(pageNumber);
}

/**
 * go to previous page
 */
function renderPreviousPage() {
  renderBookmarks(pagination.currentPage - 1);
}

/**
 * go to next page
 */
function renderNextPage() {
  renderBookmarks(pagination.currentPage + 1);
}
