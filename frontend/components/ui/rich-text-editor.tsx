"use client";

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <p>جاري تحميل المحرر...</p>
});

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

// Wrapper component for Ant Design Form compatibility
export const FormRichTextEditor: React.FC<RichTextEditorProps> = (props) => {
  return <RichTextEditor {...props} />;
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'ابدأ في كتابة المحتوى...',
  readOnly = false,
  style,
  className = ''
}) => {
  // Quill modules configuration
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
      ],
    },
    clipboard: {
      matchVisual: false,
    }
  }), []);

  // Quill formats
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'blockquote', 'code-block',
    'list', 'bullet', 'indent',
    'direction', 'align',
    'link', 'image', 'video'
  ];

  return (
    <div className={`rich-text-editor ${className}`} style={style}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        modules={modules}
        formats={formats}
        style={{
          backgroundColor: '#fff',
          borderRadius: '6px',
          direction: 'rtl'
        }}
      />
      
      <style jsx global>{`
        .rich-text-editor .ql-editor {
          min-height: 200px;
          font-size: 16px;
          line-height: 1.6;
          font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          direction: rtl;
          text-align: right;
        }
        
        .rich-text-editor .ql-toolbar {
          border-top: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          border-bottom: none;
          border-radius: 6px 6px 0 0;
        }
        
        .rich-text-editor .ql-container {
          border-bottom: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          border-top: none;
          border-radius: 0 0 6px 6px;
        }
        
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #999;
          font-style: italic;
          right: 15px;
          left: auto;
        }
        
        .rich-text-editor .ql-editor h1,
        .rich-text-editor .ql-editor h2,
        .rich-text-editor .ql-editor h3,
        .rich-text-editor .ql-editor h4,
        .rich-text-editor .ql-editor h5,
        .rich-text-editor .ql-editor h6 {
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
        
        .rich-text-editor .ql-editor h1 { font-size: 2em; }
        .rich-text-editor .ql-editor h2 { font-size: 1.5em; }
        .rich-text-editor .ql-editor h3 { font-size: 1.25em; }
        .rich-text-editor .ql-editor h4 { font-size: 1.1em; }
        
        .rich-text-editor .ql-editor p {
          margin-bottom: 1em;
        }
        
        .rich-text-editor .ql-editor ul,
        .rich-text-editor .ql-editor ol {
          padding-right: 1.5em;
          padding-left: 0;
        }
        
        .rich-text-editor .ql-editor blockquote {
          border-right: 4px solid #ddd;
          border-left: none;
          margin-right: 0;
          margin-left: 1em;
          padding-right: 1em;
          padding-left: 0;
          color: #666;
          font-style: italic;
        }
        
        .rich-text-editor .ql-picker-label {
          display: flex;
          align-items: center;
        }
        
        .rich-text-editor .ql-snow .ql-tooltip {
          direction: ltr;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
