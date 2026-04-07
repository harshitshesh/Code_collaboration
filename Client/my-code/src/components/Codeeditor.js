import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/monokai.css"; 

import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/edit/closetag";

import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";
import "codemirror/mode/clike/clike";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/css/css";

export function Codeeditor({socketref, roomid, oncodechange, readOnly, language}) {
  const editorRef = useRef(null);
  const textareaRef = useRef(null);

  const languageModes = {
      javascript: "javascript",
      python: "python",
      cpp: "text/x-c++src",
      java: "text/x-java"
  };

  useEffect(() => {
    if (!textareaRef.current) return;
    
    const init = async () => {
      const editor = CodeMirror.fromTextArea(textareaRef.current, {
        mode: languageModes[language] || "javascript",
        theme: "monokai",
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
        readOnly: readOnly ? "nocursor" : false,
      });
      
      editorRef.current = editor;
      editor.setSize(null, "100%");
      
      editor.setValue(`// Start collaborating here...\n`); 
      
      editor.on('change', (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        oncodechange(code);
        if (origin !== 'setValue') {
          socketref.current.emit('code-change', {
            roomid,
            code,
          });
        }
      });
    };

    init();
    
    // Cleanup on unmount
    return () => {
      if (editorRef.current) {
        editorRef.current.toTextArea();
      }
    };
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setOption("readOnly", readOnly ? "nocursor" : false);
    }
  }, [readOnly]);

  useEffect(() => {
      if (editorRef.current && languageModes[language]) {
          editorRef.current.setOption("mode", languageModes[language]);
      }
  }, [language]);

  useEffect(() => {
    if (socketref.current) {
      socketref.current.on('code-change', ({ code }) => {
        if (code !== null && code !== editorRef.current.getValue()) {
          editorRef.current.setValue(code);
        }
      });
    }
    return () => {
      if (socketref.current) {
        socketref.current.off('code-change');
      }
    };
  }, [socketref.current]);

  return (
    <div className="flex-grow-1" style={{ height: "100%", width: "100%", overflow: 'hidden' }}> 
      <textarea id="textareaid" ref={textareaRef}></textarea>
    </div>  
  );
}

