const fileStore = new Map();

function storeFile(documentId, buffer) {
  fileStore.set(documentId, buffer);
}

function getFile(documentId) {
  return fileStore.get(documentId) || null;
}

function deleteFile(documentId) {
  fileStore.delete(documentId);
}

module.exports = { storeFile, getFile, deleteFile };