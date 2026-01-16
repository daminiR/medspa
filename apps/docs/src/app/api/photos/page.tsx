import { Callout } from '@/components/docs/Callout'
import { Camera } from 'lucide-react'

export default function PhotosPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Camera className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge in-progress">
          <Camera className="w-3 h-3" /> Photos API
        </span>
      </div>
      <h1>Photos API</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Manage clinical photos with the Photos API. Upload before/after images, organize photo galleries,
        and maintain visual documentation for patient treatment records.
      </p>

      <h2 id="overview">Overview</h2>
      <p>
        The Photos API provides secure endpoints for uploading, managing, and retrieving clinical photography.
        Photos are automatically encrypted, stored securely, and linked to patient records and treatments.
      </p>

      <Callout type="info" title="Authentication Required">
        All Photos API endpoints require authentication. Photo access is restricted based on
        user permissions and patient consent settings.
      </Callout>

      <h2 id="list-photos">List Photos</h2>
      <p>
        Retrieve a paginated list of photos with optional filtering by patient, treatment, or date.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>GET /v1/photos</code>
      </pre>

      <h3>Query Parameters</h3>
      <div className="not-prose bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Parameter</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">limit</td>
              <td className="py-3 px-4 text-gray-600">integer</td>
              <td className="py-3 px-4 text-gray-600">Max results per page (default: 25, max: 100)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">offset</td>
              <td className="py-3 px-4 text-gray-600">integer</td>
              <td className="py-3 px-4 text-gray-600">Number of results to skip (default: 0)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">patient_id</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Filter by patient</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">treatment_id</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Filter by treatment record</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">type</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Filter by type: before, after, progress, comparison</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">body_area</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Filter by body area: face, neck, body, hands</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">taken_since</td>
              <td className="py-3 px-4 text-gray-600">date</td>
              <td className="py-3 px-4 text-gray-600">Filter photos taken after date (ISO 8601)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X GET "https://api.luxemedspa.com/v1/photos?patient_id=pat_xyz789&type=before&limit=25" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": [
    {
      "id": "photo_abc123",
      "patient_id": "pat_xyz789",
      "treatment_id": "trt_def456",
      "type": "before",
      "body_area": "face",
      "angle": "frontal",
      "url": "https://cdn.luxemedspa.com/photos/photo_abc123.jpg",
      "thumbnail_url": "https://cdn.luxemedspa.com/photos/thumb_photo_abc123.jpg",
      "taken_at": "2024-01-15T13:45:00Z",
      "taken_by": "prov_ghi789",
      "metadata": {
        "width": 2400,
        "height": 3200,
        "format": "jpeg",
        "size_bytes": 1245678
      },
      "created_at": "2024-01-15T13:45:00Z"
    }
  ],
  "pagination": {
    "limit": 25,
    "offset": 0,
    "total": 48,
    "has_more": true
  }
}`}</code>
      </pre>

      <h2 id="get-photo">Get Photo</h2>
      <p>
        Retrieve a specific photo by ID with full details.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>GET /v1/photos/{`{id}`}</code>
      </pre>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X GET "https://api.luxemedspa.com/v1/photos/photo_abc123" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "id": "photo_abc123",
    "patient_id": "pat_xyz789",
    "patient_name": "John Doe",
    "treatment_id": "trt_def456",
    "appointment_id": "apt_ghi789",
    "type": "before",
    "body_area": "face",
    "angle": "frontal",
    "description": "Pre-treatment frontal view",
    "url": "https://cdn.luxemedspa.com/photos/photo_abc123.jpg",
    "thumbnail_url": "https://cdn.luxemedspa.com/photos/thumb_photo_abc123.jpg",
    "secure_url": "https://secure.luxemedspa.com/photos/photo_abc123?token=...",
    "taken_at": "2024-01-15T13:45:00Z",
    "taken_by": "prov_ghi789",
    "taken_by_name": "Dr. Sarah Smith",
    "annotations": [
      {
        "id": "ann_123",
        "type": "marker",
        "x": 45.5,
        "y": 32.1,
        "label": "Treatment area",
        "color": "#FF0000"
      }
    ],
    "metadata": {
      "width": 2400,
      "height": 3200,
      "format": "jpeg",
      "size_bytes": 1245678,
      "camera": "iPad Pro",
      "orientation": "portrait"
    },
    "linked_photos": [
      {
        "id": "photo_abc124",
        "type": "after",
        "thumbnail_url": "https://cdn.luxemedspa.com/photos/thumb_photo_abc124.jpg"
      }
    ],
    "consent_obtained": true,
    "consent_date": "2024-01-15T13:40:00Z",
    "created_at": "2024-01-15T13:45:00Z",
    "updated_at": "2024-01-15T13:45:00Z"
  }
}`}</code>
      </pre>

      <h2 id="upload-photo">Upload Photo</h2>
      <p>
        Upload a new clinical photo. Use multipart form data for the image file.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>POST /v1/photos</code>
      </pre>

      <h3>Request Body (multipart/form-data)</h3>
      <div className="not-prose bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Field</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Required</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">file</td>
              <td className="py-3 px-4 text-gray-600">file</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">Image file (JPEG, PNG, HEIC). Max 20MB.</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">patient_id</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">ID of the patient</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">type</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">Photo type: before, after, progress</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">body_area</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">Body area: face, neck, body, hands</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">angle</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">No</td>
              <td className="py-3 px-4 text-gray-600">Camera angle: frontal, left, right, oblique</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">treatment_id</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">No</td>
              <td className="py-3 px-4 text-gray-600">Associated treatment record</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">description</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">No</td>
              <td className="py-3 px-4 text-gray-600">Description of the photo</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">link_to_photo</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">No</td>
              <td className="py-3 px-4 text-gray-600">ID of related photo (for before/after pairs)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X POST "https://api.luxemedspa.com/v1/photos" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@/path/to/photo.jpg" \\
  -F "patient_id=pat_xyz789" \\
  -F "type=before" \\
  -F "body_area=face" \\
  -F "angle=frontal" \\
  -F "treatment_id=trt_def456" \\
  -F "description=Pre-treatment frontal view"`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "id": "photo_new789",
    "patient_id": "pat_xyz789",
    "treatment_id": "trt_def456",
    "type": "before",
    "body_area": "face",
    "angle": "frontal",
    "url": "https://cdn.luxemedspa.com/photos/photo_new789.jpg",
    "thumbnail_url": "https://cdn.luxemedspa.com/photos/thumb_photo_new789.jpg",
    "metadata": {
      "width": 2400,
      "height": 3200,
      "format": "jpeg",
      "size_bytes": 1245678
    },
    "created_at": "2024-01-15T13:45:00Z"
  }
}`}</code>
      </pre>

      <Callout type="tip" title="Photo Consent">
        Always ensure patient consent is obtained before taking clinical photos.
        Use the consent_obtained field to track consent status.
      </Callout>

      <h2 id="generate-upload-url">Generate Signed Upload URL</h2>
      <p>
        For large files or direct browser uploads, generate a pre-signed URL.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>POST /v1/photos/upload-url</code>
      </pre>

      <h3>Request Body</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "patient_id": "pat_xyz789",
  "filename": "before_photo.jpg",
  "content_type": "image/jpeg",
  "metadata": {
    "type": "before",
    "body_area": "face"
  }
}`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "upload_url": "https://upload.luxemedspa.com/photos?signature=...",
    "photo_id": "photo_pending123",
    "expires_at": "2024-01-15T14:45:00Z",
    "fields": {
      "key": "photos/photo_pending123.jpg",
      "policy": "...",
      "signature": "..."
    }
  }
}`}</code>
      </pre>

      <h2 id="update-photo">Update Photo</h2>
      <p>
        Update photo metadata, description, or annotations.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>PUT /v1/photos/{`{id}`}</code>
      </pre>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X PUT "https://api.luxemedspa.com/v1/photos/photo_abc123" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "description": "Updated: Pre-treatment frontal view showing glabellar lines",
    "type": "before",
    "link_to_photo": "photo_abc124"
  }'`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "id": "photo_abc123",
    "description": "Updated: Pre-treatment frontal view showing glabellar lines",
    "linked_photos": ["photo_abc124"],
    "updated_at": "2024-01-15T14:00:00Z"
  }
}`}</code>
      </pre>

      <h2 id="add-annotation">Add Annotation</h2>
      <p>
        Add annotations or markers to a photo for clinical documentation.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>POST /v1/photos/{`{id}`}/annotations</code>
      </pre>

      <h3>Request Body</h3>
      <div className="not-prose bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Field</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Required</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">type</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">Annotation type: marker, circle, arrow, text</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">x</td>
              <td className="py-3 px-4 text-gray-600">number</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">X position (percentage 0-100)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">y</td>
              <td className="py-3 px-4 text-gray-600">number</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">Y position (percentage 0-100)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">label</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">No</td>
              <td className="py-3 px-4 text-gray-600">Text label for the annotation</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">color</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">No</td>
              <td className="py-3 px-4 text-gray-600">Hex color code (default: #FF0000)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X POST "https://api.luxemedspa.com/v1/photos/photo_abc123/annotations" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "marker",
    "x": 45.5,
    "y": 32.1,
    "label": "Treatment area - 10 units",
    "color": "#FF0000"
  }'`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "id": "ann_new456",
    "photo_id": "photo_abc123",
    "type": "marker",
    "x": 45.5,
    "y": 32.1,
    "label": "Treatment area - 10 units",
    "color": "#FF0000",
    "created_at": "2024-01-15T14:15:00Z"
  }
}`}</code>
      </pre>

      <h2 id="create-comparison">Create Comparison</h2>
      <p>
        Generate a side-by-side comparison of before and after photos.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>POST /v1/photos/comparison</code>
      </pre>

      <h3>Request Body</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "before_photo_id": "photo_abc123",
  "after_photo_id": "photo_abc124",
  "layout": "side_by_side",
  "include_dates": true
}`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "id": "comp_xyz789",
    "before_photo_id": "photo_abc123",
    "after_photo_id": "photo_abc124",
    "layout": "side_by_side",
    "comparison_url": "https://cdn.luxemedspa.com/comparisons/comp_xyz789.jpg",
    "days_between": 14,
    "created_at": "2024-01-29T10:00:00Z"
  }
}`}</code>
      </pre>

      <h2 id="delete-photo">Delete Photo</h2>
      <p>
        Delete a photo. This action is permanent and cannot be undone.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>DELETE /v1/photos/{`{id}`}</code>
      </pre>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X DELETE "https://api.luxemedspa.com/v1/photos/photo_abc123" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "id": "photo_abc123",
    "deleted": true,
    "deleted_at": "2024-01-15T16:00:00Z"
  }
}`}</code>
      </pre>

      <Callout type="warning" title="Photo Deletion">
        Deleting photos is permanent. Consider archiving instead if you may need the photo later.
        Photos linked to signed treatment records may be protected from deletion.
      </Callout>

      <h2 id="data-types">Key Data Types</h2>

      <h3>Photo Object</h3>
      <div className="not-prose bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Field</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">id</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Unique photo identifier</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">type</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">before, after, progress, comparison</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">body_area</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">face, neck, body, hands</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">angle</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">frontal, left, right, oblique</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">url</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Full-size image URL</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">thumbnail_url</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Thumbnail image URL</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Annotation Object</h3>
      <div className="not-prose bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Field</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">type</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">marker, circle, arrow, text</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">x, y</td>
              <td className="py-3 px-4 text-gray-600">number</td>
              <td className="py-3 px-4 text-gray-600">Position as percentage (0-100)</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">label</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Text label for the annotation</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="errors">Error Codes</h2>
      <div className="not-prose bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Code</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">PHOTO_NOT_FOUND</td>
              <td className="py-3 px-4 text-gray-600">404</td>
              <td className="py-3 px-4 text-gray-600">Photo does not exist</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">INVALID_FILE_TYPE</td>
              <td className="py-3 px-4 text-gray-600">400</td>
              <td className="py-3 px-4 text-gray-600">File must be JPEG, PNG, or HEIC</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">FILE_TOO_LARGE</td>
              <td className="py-3 px-4 text-gray-600">400</td>
              <td className="py-3 px-4 text-gray-600">File exceeds 20MB limit</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">PHOTO_PROTECTED</td>
              <td className="py-3 px-4 text-gray-600">403</td>
              <td className="py-3 px-4 text-gray-600">Photo linked to signed treatment</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">CONSENT_REQUIRED</td>
              <td className="py-3 px-4 text-gray-600">403</td>
              <td className="py-3 px-4 text-gray-600">Patient consent not on file</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="info" title="HIPAA Compliance">
        Clinical photos contain PHI and must be handled according to HIPAA regulations.
        All photos are encrypted at rest and in transit. Access is logged for audit purposes.
      </Callout>
    </div>
  )
}
