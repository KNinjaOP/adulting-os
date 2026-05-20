import { useDropzone } from 'react-dropzone'
import { Upload, File, X } from 'lucide-react'
import { useState } from 'react'

export default function FileUploader({ onFileSelect, accept = { 'image/*': [], 'application/pdf': [] }, label = 'Upload File' }) {
  const [preview, setPreview] = useState(null)
  const [fileName, setFileName] = useState(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDrop: (accepted) => {
      if (accepted.length > 0) {
        const file = accepted[0]
        setFileName(file.name)
        onFileSelect(file)
        if (file.type.startsWith('image/')) {
          setPreview(URL.createObjectURL(file))
        } else {
          setPreview(null)
        }
      }
    },
  })

  const clear = (e) => {
    e.stopPropagation()
    setPreview(null)
    setFileName(null)
    onFileSelect(null)
  }

  return (
    <div
      {...getRootProps()}
      style={{
        border: `2px dashed ${isDragActive ? '#6366f1' : 'var(--border-strong)'}`,
        borderRadius: '0.875rem',
        padding: preview ? '1rem' : '1.5rem',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        background: isDragActive ? 'rgba(99,102,241,0.07)' : 'var(--input-bg)',
        position: 'relative',
      }}
    >
      <input {...getInputProps()} />
      {preview ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img src={preview} alt="preview" style={{ maxHeight: '140px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }} />
          <button onClick={clear} style={{
            position: 'absolute', top: '-8px', right: '-8px',
            background: '#f43f5e', border: 'none', borderRadius: '50%',
            width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}>
            <X size={12} color="white" />
          </button>
        </div>
      ) : fileName ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#818cf8' }}>
          <File size={18} />
          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{fileName}</span>
          <button onClick={clear} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f43f5e' }}>
            <X size={14} />
          </button>
        </div>
      ) : (
        <div>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem'
          }}>
            <Upload size={18} color="#6366f1" />
          </div>
          <p style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500 }}>
            {isDragActive ? 'Drop the file here' : label}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.25rem' }}>
            PNG, JPG, WEBP, PDF up to 10MB
          </p>
        </div>
      )}
    </div>
  )
}
