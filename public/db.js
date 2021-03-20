let db;
const request = window.indexedDB.open("budget", 1);

var request = objectStore.clear();

request.onupgradeneeded = function (e) {
  const db = request.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (e) {
  db = e.target.result;
  if (navigator.online) {
    checkDatabase();
  }
};

request.onerror = function (e) {
  console.log("Error" + e.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  store.add(record);
}

function checkDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(transaction),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
        });
    }
  };
}

function deletePending() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  store.clear();
}

window.addEventListener("online", checkDatabase);