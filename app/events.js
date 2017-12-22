/**
 * Gets an XPath for an element which describes its hierarchical location.
 * Copied from firebug with a BSD licence - https://code.google.com/p/fbug/source/browse/branches/firebug1.6/content/firebug/lib.js?spec=svn12950&r=8828#1332
 */
const $ = require('jquery');

const SESSION_TIMEOUT = 2 * 3600 * 1000;

let eventFailCount = 0;

let timer = setTimeout(() => {
  window.location.href = '/signout';
}, SESSION_TIMEOUT); // set session logout to 2 hours

const refreshSession = () => {
  console.log('Session refreshed...');
  clearTimeout(timer);
  timer = setTimeout(() => {
    window.location.href = '/signout';
  }, SESSION_TIMEOUT); // set session logout to 2 hours
};

const getElementTreeXPath = (element) => {
  const paths = [];
  let el = element;

  // Use nodeName (instead of localName) so namespace prefix is included (if any).
  for (; el && el.nodeType === 1; el = el.parentNode) {
    let index = 0;
    for (
      let sibling = el.previousSibling;
      sibling;
      sibling = sibling.previousSibling
    ) {
      // Ignore document type declaration.
      if (sibling.nodeType !== Node.DOCUMENT_TYPE_NODE && sibling.nodeName === el.nodeName) {
        index += 1;
      }
    }

    const tagName = el.nodeName.toLowerCase();
    const pathIndex = index ? `[${index + 1}]` : '';
    paths.splice(0, 0, tagName + pathIndex);
  }

  return paths.length ? `/${paths.join('/')}` : null;
};

const getElementXPath = (el) => {
  if (el && el.id) return `//*[@id="${el.id}"]`;
  return getElementTreeXPath(el);
};

const logInfo = (event, type, href) => {
  refreshSession();
  const obj = {};
  obj.url = href || window.location.href;
  obj.type = type;
  obj.data = [];
  let text = '';
  if (event) {
    obj.xpath = getElementXPath(event.target);

    const t = event.target;

    /* SMASH specific stuff - might need it after testing
        if (t.nodeName.toLowerCase() === "span") {
          if (t.parentNode.nodeName.toLowerCase() === "button") {
            t = t.parentNode;
          } else if (t.parentNode.nodeName.toLowerCase() === "a") {
            t = t.parentNode;
          }
        }

        if (t.nodeName.toLowerCase() === "a") {
          obj.text = $(t).text().trim();
        } else if (t.nodeName.toLowerCase() === "select") {
          if (t.selectedIndex) {
            obj.text = $(t.item(t.selectedIndex)).text().trim();
          }
        } else if (t.nodeName.toLowerCase() === "button") {
          obj.text = $(t).text().trim();
        } else if ($(t).data('patient-id')) {
          obj.text = "NHS number for patient id " + $(t).data('patient-id');
           //Don't want to capture nhs numbers in the events
        } else if ($(t).hasClass('scroll-table-header') ||
        $(t).parent().hasClass('scroll-table-header') || $(t).hasClass('scroll-table-body')
        || $(t).parent().hasClass('scroll-table-body')) {
          obj.text = ""; //Edge case where entire table is copied- never want thi,
          especially if nhs numbers in it
        } else if ($(t).text().trim() !== "") {
          obj.text = $(t).text().trim();
        } */
    text = $(t)
      .text()
      .trim()
      .replace(/\n/g, '')
      .replace(/ +/g, ' ')
      .substring(0, 50);

    // Final double check
    text = text.replace(/(?:^|\D)(\d{10})(?=\D|$)/g, 'xxxxxxxxxx'); // replaces any 10 digit characters with xxxxxxxxxx
  } // if(event)

  if (text !== '') {
    obj.data.push({ key: 'text', value: text });
  }
  // console.log(obj);
  setTimeout(() => {
    const dataToSend = { event: obj };
    $.ajax({
      type: 'POST',
      url: '/api/event',
      data: JSON.stringify(dataToSend),
      success() {
        eventFailCount = 0;
      },
      error() {
        eventFailCount += 1;
        if (eventFailCount > 2) {
          // We've had too many errors from the back end - could be the server
          // is down, or has restarted and the session has ended. Either way
          // a page refresh might help
          window.location.reload();
        }
      },
      dataType: 'json',
      contentType: 'application/json',
    });
  }, 1);
};

const delay = 500;
const setTimeoutConst = {};
let isListening = false;

module.exports = {
  listen() {
    if (isListening) {
      console.log('Hmm - trying to do the global listening more than once..');
      return;
    }

    isListening = true;

    $(document)
      .on('keyup', (event) => {
        // if enter, tab, arrows then record
        if (event.which === 13) {
          // enter
          logInfo(event, 'Key_ENTER');
        } else if (event.which === 9) {
          // tab
          logInfo(event, 'Key_TAB');
        } else if (event.which === 38) {
          // arrow up
          logInfo(event, 'Key_ARROW_UP');
        } else if (event.which === 40) {
          // arrow down
          logInfo(event, 'Key_ARROW_DOWN');
        } else if (event.which === 37) {
          // arrow left
          logInfo(event, 'Key_ARROW_LEFT');
        } else if (event.which === 39) {
          // arrow up
          logInfo(event, 'Key_ARROW_RIGHT');
        }
      })
      .on('mouseover', (event) => {
        setTimeoutConst[event.target] = setTimeout(() => {
          logInfo(event, 'hover');
        }, delay);
      })
      .on('mouseout', (event) => {
        clearTimeout(setTimeoutConst[event.target]);
      })
      .on('click', (event) => {
        clearTimeout(setTimeoutConst[event.target]);
        setTimeoutConst[event.target] = setTimeout(() => {
          logInfo(event, 'hover');
        }, delay);
        logInfo(event, 'click');
      });
  },
};
