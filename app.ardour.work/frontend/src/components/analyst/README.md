# SourcesTab Component

A comprehensive sources management component with Public and Private sources tracking.

## Features

### Public Sources Tab
- Display sources with citation numbers [1], [2], [3]...
- Show usage count for each source
- Search and filter sources
- Copy citation references
- Edit source details
- Statistics dashboard showing:
  - Total Sources (294)
  - Total Citations (619)
  - Unique Domains (198)

### Private Sources Tab
- Upload private documents (PDF, DOCX, TXT, MD)
- Drag-and-drop file upload
- Display uploaded documents list
- Remove uploaded documents
- Shows file size and upload date

## Usage

```tsx
import { SourcesTab } from './components/analyst';

function MyComponent() {
  return (
    <div className="h-screen">
      <SourcesTab documentId="doc-123" />
    </div>
  );
}
```

## Props

- `documentId` (optional): The ID of the document to associate sources with

## Styling

The component uses Tailwind CSS with a dark theme:
- Background: slate-900
- Cards: slate-800 with blur effects
- Citation numbers: Blue to purple gradient
- Statistics: Cyan to blue gradient numbers
- Hover effects and smooth transitions

## Component Structure

```
SourcesTab/
├── Tab Navigation (Public/Private)
├── Public Sources
│   ├── Search Bar
│   ├── Sources List
│   │   ├── Citation Number Badge
│   │   ├── Usage Count
│   │   ├── Source Title
│   │   ├── Domain/URL
│   │   └── Actions (Edit, Copy)
│   └── Statistics Section
│       ├── Total Sources
│       ├── Total Citations
│       └── Unique Domains
└── Private Sources
    ├── Upload Area (Drag & Drop)
    ├── Upload Button
    └── Uploaded Documents List
        ├── Document Card
        │   ├── File Icon
        │   ├── File Name
        │   ├── File Size
        │   ├── Upload Date
        │   └── Remove Button
        └── ...
```

## Icons Used (lucide-react)

- Globe: Public sources indicator
- Lock: Private sources indicator
- Upload: File upload
- Copy: Copy citation
- Edit2: Edit source
- Search: Search functionality
- FileText: Document indicator
- X: Remove document
- Paperclip: Attachments
- CheckCircle: Copy success confirmation
