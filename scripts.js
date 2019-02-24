const links = [];
let currentPage = 0;

/**
 * add event listeners and loads bookmarks
 */
function setup() {
  console.log('setup');
  document.querySelector('input#url').addEventListener('keyup', validateURL);
  document.querySelector('.submit-link-form > form').addEventListener('submit', addLink);
  loadPersistedBookmarks();
}

/**
 * loads bookmarks from persistent storage
 */
function loadPersistedBookmarks() {
  console.log('loading bookmarks');
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
  renderLinks();
  return false;
}

// TODO: editLink (replace with input field)

// TODO: updateLink (update in list)

// TODO: deleteLink (delete from list)

// render a bookmark page
function renderLinks() {
  const urls = [
    'https://phantom.land',
    'https://google.com',
    'https://twitter.com',
    'https://facebook.com',
  ];

  const bookmarkList = document.querySelector('.bookmark-list > ul');

  [...urls, ...urls, ...urls, ...urls, ...urls, ...urls, ...urls, ...urls]
    .forEach(url =>{
      const listElement = document.createElement('li');
      const anchor = document.createElement('a');
      const text = document.createTextNode(url);

      anchor.title = url;
      anchor.href = url;
      anchor.appendChild(text); // text into <a>

      listElement.classList.add('bookmark');
      listElement.appendChild(anchor); // <a> into <li>

      bookmarkList.appendChild(listElement); // <li> into <ul>
    });

}
