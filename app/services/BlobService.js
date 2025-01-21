const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');

// Retrieve these values from your environment or configuration
const accountName = process.env.ACCOUNT_NAME;
const sasToken = process.env.SAS_TOKE;
const containerName = process.env.CONTAINER_NAME;

const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net${sasToken}`
);

const containerClient = blobServiceClient.getContainerClient(containerName);

/**
 * Upload a file to Azure Blob Storage
 * @param {string} filePath - The local path to the file to upload
 * @param {string} blobName - The name to assign to the blob in storage
 * @returns {string} - The URL of the uploaded blob
 */
const uploadFileToBlob = async (filePath, blobName) => {
  try {
    // Get a block blob client for the blobName within the container
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload the file to blob storage from the specified file path
    await blockBlobClient.uploadFile(filePath);
    
    console.log(`File uploaded to blob with URL: ${blockBlobClient.url}`);
    return blockBlobClient.url;
  } catch (error) {
    console.error('Error uploading file to blob:', error);
    throw error;
  }
};

module.exports = {
  uploadFileToBlob,
};
