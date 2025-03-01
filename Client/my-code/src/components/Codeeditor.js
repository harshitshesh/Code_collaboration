import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";

// CodeMirror core CSS & theme
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css"; 

// CodeMirror addons (bracket & tag closing)
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/edit/closetag";

// CodeMirror language modes
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/css/css";

export function Codeeditor() {
  const editorRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!textareaRef.current) return;

    // Initialize CodeMirror
    const editor = CodeMirror.fromTextArea(textareaRef.current, {
      mode: "javascript",
      theme: "material",
      autoCloseTags: true,
      autoCloseBrackets: true,
      lineNumbers: true,
    });

    
    editor.setSize(null, "100%");
    editor.setValue(`// Start Your Contribution here...\n \n console.log("wellcome share your ideas")`); 

  }, []);

  return (
    <div style={{height:"100vh", width: "100%" }}> 
      <textarea ref={textareaRef}></textarea>
    </div>  
  );
}
