const textStore = new Map();
const displayNameStore = new Map(); // documentId -> current display name

function storeText(documentId, text) {
  textStore.set(documentId, text);
}

function getText(documentId) {
  return textStore.get(documentId) || null;
}

function setDisplayName(documentId, name) {
  displayNameStore.set(documentId, name);
}

function getDisplayName(documentId) {
  return displayNameStore.get(documentId) || null;
}

function deleteDocumentData(documentId) {
  textStore.delete(documentId);
  displayNameStore.delete(documentId);
}

module.exports = { storeText, getText, setDisplayName, getDisplayName, deleteDocumentData };