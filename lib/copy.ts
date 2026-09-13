export const copy = {
  app: {
    name: "Marc's Library",
    description: 'Scan a barcode, see the book, change its status.',
  },

  nav: {
    library: 'Library',
    scan: 'Scan',
    add: 'Add',
  },

  titles: {
    addBook: 'Add a book',
    book: 'Book',
    editBook: 'Edit book',
    scan: 'Scan',
    notFound: 'Not found',
  },

  back: 'Back',
  theme: 'Theme',

  library: {
    emptyLead: 'No books yet. Tap',
    emptyMid: 'to enter your first one, or',
    emptyEnd: 'a label.',
    emptyNoMatch: 'No books match that search.',
  },

  notFound: {
    message: 'That page is not here.',
    backLink: 'Back to the library',
  },

  book: {
    webSearch: 'Web Search',
    editDetails: 'Edit details',
    history: 'History',
  },

  statusActions: {
    changeStatus: 'Change status',
    removeBook: 'Remove book',
    removing: 'Removing…',
    confirmRemove: (title: string) => `Remove "${title}" from the library?`,
  },

  form: {
    title: 'Title',
    author: 'Author',
    barcode: 'Barcode',
    isbn: 'ISBN',
    status: 'Status',
    saveChanges: 'Save changes',
    saving: 'Saving…',
    addToLibrary: 'Add to library',
    adding: 'Adding…',
  },

  search: {
    placeholder: 'Search title, author, ISBN or barcode',
    ariaLabel: 'Search the library',
    all: 'All',
  },

  scan: {
    initialHint: 'Point the camera at a shelf label, or at the ISBN barcode on the back of a new book.',
    starting: 'Starting the camera…',
    needsHttps: 'The camera needs an https connection (or localhost). You can still type a barcode below.',
    barcodeNumber: 'Barcode number',
    barcodePlaceholder: '0000167',
    lookUp: 'Look up',
    permissionDenied: 'Camera permission was denied. Type the barcode below instead.',
    noCamera: 'No camera found on this device. Type the barcode below instead.',
    cameraUnavailable: 'Camera unavailable.',
    tryTypingInstead: 'Type the barcode below instead.',
    loadFailed: 'Could not load the barcode scanning library. Check your connection.',
  },

  statuses: {
    available: 'Available',
    loaned: 'Loaned',
    hold: 'On hold',
    reading: 'Reading',
    missing: 'Missing',
  },

  errors: {
    generic: 'Something went wrong.',
    bookNotFound: 'Book not found.',
    barcodeRequired: 'A barcode is required.',
    barcodeTaken: (code: string, title: string) => `Barcode ${code} is already "${title}".`,
    unknownStatus: (status: string) => `Unknown status "${status}".`,
    invalidJson: 'Request body is not valid JSON.',
    titleRequired: 'A title is required.',
    couldNotAddBook: 'Could not add that book.',
    couldNotSave: 'Could not save that.',
    couldNotSetStatus: 'Could not set that status.',
    noBookForBarcode: 'No book with that barcode.',
    tursoConfig: 'TURSO_DATABASE_URL is set but TURSO_AUTH_TOKEN is not. Set both, or neither to use a local file.',
  },

  defaults: {
    untitled: 'Untitled',
  },
} as const;
