import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";


import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css"; 

import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/edit/closetag";


import "codemirror/mode/javascript/javascript";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/css/css";

export function Codeeditor({socketref,roomid ,oncodechange}) {

  
  const editorRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!textareaRef.current) return;
let init = async ()=>{


  const editor = CodeMirror.fromTextArea(textareaRef.current,document.getElementById("textareaid"), {
    mode: "javascript",
    theme: "dracula",
    autoCloseTags: true,
    autoCloseBrackets: true,
    lineNumbers: true,
  });
  
  editorRef.current =  editor

  editor.setSize(null, "100%");
  editor.setValue(`// Start Your Contribution here...\n \n console.log("wellcome share your ideas")`); 
  
  editor.on('change',(instance,changes)=>{
    // console.log(`changes`,instance,changes)

    const {origin} = changes;
    const code = instance.getValue()
    oncodechange(code)
    if(origin !== 'setValue'){
      socketref.current.emit('code-change',{
        roomid,
        code,
      }) 
    }


  })
  
  
}

init()
}, []);


useEffect(()=>{
  if(socketref.current){
      socketref.current.on('code-change',({code})=>{
        if(code !== null){
          editorRef.current.setValue(code)
        }
      })

    }
    return ()=>{
      socketref.current.off('code-change')
    }
  },[socketref.current])

  return (
    <div style={{height:"100vh", width: "100%" }}> 
      <textarea id="textareaid" ref={textareaRef}></textarea>
    </div>  
  );
}
