import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css"; 

import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/edit/closetag";

import "codemirror/mode/javascript/javascript";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/css/css";

export function Codeeditor({socketref, roomid, oncodechange}) {
  const editorRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!textareaRef.current) return;
    
    const init = async () => {
      const editor = CodeMirror.fromTextArea(textareaRef.current, {
        mode: { name: "javascript", json: true },
        theme: "dracula",
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      });
      
      editorRef.current = editor;
      editor.setSize(null, "100%");
      
      editor.setValue(`// Start collaborating here...\n\nfunction helloWorld() {\n  console.log("Welcome to Code Collab!");\n}\n\nhelloWorld();`); 
      
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

