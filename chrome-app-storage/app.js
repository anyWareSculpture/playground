(function(){
  var storageA = document.getElementById('storage-a');
  var storageAinput = document.getElementById('storage-a-value');
  var storageAform = document.getElementById('storage-a-form');

  var logarea = document.querySelector('textarea');

  document.addEventListener("keydown", function(e) {
    if (e.keyCode == 0xbc && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      chrome.app.window.create('prefs.html', {
        'bounds': {
          'width': 600,
          'height': 500
        }
      });
    }
  });

  window.onload = function() {
    var manifest = chrome.runtime.getManifest();
    var v = document.getElementById('anyware-version');
    v.innerHTML = manifest.version;

    var restart = document.getElementById('restart');
    restart.addEventListener('click', function() {
      chrome.runtime.reload();
    });
  }

  function log(str) {
    logarea.value=str+"\n"+logarea.value;
  }
  
  storageAform.addEventListener('submit', function(ev) {
    var newValue = storageAinput.value;
    chrome.storage.local.set({"storage-a-value": newValue}, function() {
      log("setting storage A to " + newValue);
    });
    ev.preventDefault();
  });

  var storageB = document.getElementById('storage-b');
  var storageBinput = document.getElementById('storage-b-value');
  var storageBform = document.getElementById('storage-b-form');

  var logarea = document.querySelector('textarea');

  storageBform.addEventListener('submit', function(ev) {
    var newValue = storageBinput.value;
    chrome.storage.sync.set({"storage-b-value": newValue}, function() {
      log("setting storage B to " + newValue);
    });
    ev.preventDefault();
  });

  function valueChanged(elem, newValue) {
    elem.innerText = newValue;
    log("value storage changed to "+newValue);
  }

  // For debugging purposes:
  function debugChanges(changes, namespace) {
    for (key in changes) {
      console.log('Storage change: key='+key+' value='+JSON.stringify(changes[key]));
    }
  }  

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    console.log('onChanged');
    console.debug(changes);
    if (changes["storage-a-value"]) valueChanged(storageA, changes["storage-a-value"].newValue);
    if (changes["storage-b-value"]) valueChanged(storageB, changes["storage-b-value"].newValue);
    debugChanges(changes, namespace);
  });

  chrome.storage.local.get("storage-a-value", function(val) {valueChanged(storageA, val['storage-a-value'])});
  chrome.storage.sync.get("storage-b-value", function(val) {valueChanged(storageB, val['storage-b-value'])});

})();
