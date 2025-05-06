import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = () => {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('// Write your code here');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('Output will be shown here');

  const handleRunCode = () => {
    // TODO: Connect to compiler API like Judge0
    setOutput('Code execution result (mock)');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: 'auto' }}>
      <h2 style={{ marginBottom: '20px' }}>Online Code Editor</h2>

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={{ padding: '10px', marginBottom: '20px', width: '100%' }}
      >
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="cpp">C++</option>
        <option value="java">Java</option>
      </select>

      <Editor
        height="300px"
        language={language}
        value={code}
        onChange={(value) => setCode(value)}
        theme="vs-dark"
      />

      <textarea
        placeholder="Input (optional)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{
          width: '100%',
          height: '80px',
          marginTop: '20px',
          padding: '10px',
          fontSize: '14px',
        }}
      />

      <button
        onClick={handleRunCode}
        style={{
          marginTop: '15px',
          padding: '10px 20px',
          backgroundColor: '#319795',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Run Code
      </button>

      <textarea
        placeholder="Output"
        value={output}
        readOnly
        style={{
          width: '100%',
          height: '100px',
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#f5f5f5',
        }}
      />
    </div>
  );
};

export default CodeEditor;
