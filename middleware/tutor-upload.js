const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const multer = require('multer');

const uploadDirectory = path.join(
  os.homedir(),
  'AppData',
  'Local',
  'ExcellenceTutor',
  'private-uploads'
);

fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedTypes = {
  cv: new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]),
  fayda: new Set([
    'application/pdf',
    'image/jpeg',
    'image/png'
  ])
};

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (request, file, callback) => {
    callback(null, `${request.session.user.id}-${file.fieldname}-${Date.now()}-${require('node:crypto').randomUUID()}`);
  }
});

const uploadTutorDocuments = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 2
  },
  fileFilter: (request, file, callback) => {
    const allowed = allowedTypes[file.fieldname];

    if (!allowed || !allowed.has(file.mimetype)) {
      return callback(new Error(`Unsupported file type for ${file.fieldname}.`));
    }

    callback(null, true);
  }
}).fields([
  { name: 'cv', maxCount: 1 },
  { name: 'fayda', maxCount: 1 }
]);

module.exports = { uploadDirectory, uploadTutorDocuments };
