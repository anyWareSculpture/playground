(function() {
  chrome.storage.local.get(null,function(data) {
    if (data.username) document.getElementById('username').value = data.username;
    if (data.password) document.getElementById('password').value = data.password;
    document.getElementById('save').addEventListener('click', function(e) {
      e.preventDefault();
      var username = document.getElementById('username').value;
      var password = document.getElementById('password').value;
      chrome.storage.local.set({'username':username});
      chrome.storage.local.set({'password':password});
      chrome.runtime.reload();
    });
  });
})();
