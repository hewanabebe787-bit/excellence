const fs = require('node:fs/promises');
const path = require('node:path');
const db = require('../db');
const { uploadDirectory } = require('../middleware/tutor-upload');

function hasSignature(type, buffer) {
  if (type === 'pdf') {
    return buffer.subarray(0, 5).toString() === '%PDF-';
  }

  if (type === 'jpg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (type === 'png') {
    return buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    );
  }

  if (type === 'doc') {
    return buffer.subarray(0, 8).equals(
      Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])
    );
  }

  if (type === 'docx') {
    return buffer.subarray(0, 4).equals(
      Buffer.from([0x50, 0x4b, 0x03, 0x04])
    );
  }

  return false;
}

async function fileHasValidSignature(file) {
  const handle = await fs.open(file.path, 'r');

  try {
    const buffer = Buffer.alloc(8);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);

    if (file.mimetype === 'application/pdf') {
      return hasSignature('pdf', buffer.subarray(0, bytesRead));
    }

    if (file.mimetype === 'image/jpeg') {
      return hasSignature('jpg', buffer.subarray(0, bytesRead));
    }

    if (file.mimetype === 'image/png') {
      return hasSignature('png', buffer.subarray(0, bytesRead));
    }

    if (file.mimetype === 'application/msword') {
      return hasSignature('doc', buffer.subarray(0, bytesRead));
    }

    if (
      file.mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return hasSignature('docx', buffer.subarray(0, bytesRead));
    }

    return false;
  } finally {
    await handle.close();
  }
}

async function removeNewUploads(files) {
  for (const file of files) {
    try {
      await fs.unlink(file.path);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Could not remove rejected tutor upload:', error);
      }
    }
  }
}
// const form = document.getElementById('application-form');

// form.addEventListener('submit', async (event) => {
//   event.preventDefault();

//   const formData = new FormData();
//   formData.append('cv', document.getElementById('cv').files[0]);
//   formData.append('fayda', document.getElementById('fayda').files[0]);

//   const response = await fetch('/api/tutor/documents', {
//     method: 'POST',
//     body: formData
//   });

//   const result = await response.json();

//   if (!response.ok) {
//     throw new Error(result.error || 'Upload failed.');
//   }

//   console.log('Documents uploaded:', result);
// });

async function uploadTutorDocuments(request, response) {
  const files = [
    ...(request.files?.cv || []),
    ...(request.files?.fayda || [])
  ];
  let client;
  let transactionStarted = false;

  try {
    if (!request.files?.cv?.[0] || !request.files?.fayda?.[0]) {
      return response.status(400).json({
        error: 'Upload both your CV and Fayda document.'
      });
    }

    for (const file of files) {
      if (!(await fileHasValidSignature(file))) {
        return response.status(400).json({
          error: `The uploaded ${file.fieldname} file content does not match its file type.`
        });
      }
    }

    client = await db.connect();
    await client.query('BEGIN');
    transactionStarted = true;

    const oldDocuments = await client.query(
      `SELECT storage_key
       FROM tutor_documents
       WHERE tutor_user_id = $1`,
      [request.session.user.id]
    );

    for (const [documentType, file] of [
      ['cv', request.files.cv[0]],
      ['fayda', request.files.fayda[0]]
    ]) {
      await client.query(
        `INSERT INTO tutor_documents
           (tutor_user_id, document_type, storage_key, mime_type, size_bytes)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (tutor_user_id, document_type)
         DO UPDATE SET storage_key = EXCLUDED.storage_key,
                       mime_type = EXCLUDED.mime_type,
                       size_bytes = EXCLUDED.size_bytes,
                       uploaded_at = NOW()`,
        [
          request.session.user.id,
          documentType,
          path.basename(file.filename),
          file.mimetype,
          file.size
        ]
      );
    }

    await client.query('COMMIT');
    transactionStarted = false;

    const newKeys = new Set(files.map((file) => path.basename(file.filename)));
    for (const document of oldDocuments.rows) {
      if (!newKeys.has(document.storage_key)) {
        try {
          await fs.unlink(path.join(uploadDirectory, document.storage_key));
        } catch (error) {
          if (error.code !== 'ENOENT') {
            console.error('Could not remove replaced tutor document:', error);
          }
        }
      }
    }

    response.json({ message: 'CV and Fayda uploaded successfully.' });
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Tutor document rollback failed:', rollbackError);
      }
    }

    await removeNewUploads(files);
    console.error('Tutor document upload failed:', error);
    response.status(500).json({ error: 'Could not save your documents.' });
  } finally {
    if (client) client.release();
  }
}

module.exports = { uploadTutorDocuments };
