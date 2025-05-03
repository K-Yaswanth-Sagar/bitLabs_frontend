import React, { useState } from 'react';
import { Box, Select, Button, Textarea, VStack, Heading } from '@chakra-ui/react';
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
    <VStack p={4} spacing={4} align="stretch">
      <Heading size="lg">Online Code Editor</Heading>

      <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="cpp">C++</option>
        <option value="java">Java</option>
      </Select>

      <Editor
        height="300px"
        language={language}
        value={code}
        onChange={(value) => setCode(value)}
        theme="vs-dark"
      />

      <Textarea
        placeholder="Input (optional)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <Button colorScheme="teal" onClick={handleRunCode}>
        Run Code
      </Button>

      <Textarea
        placeholder="Output"
        value={output}
        isReadOnly
        bg="gray.100"
        height="100px"
      />
    </VStack>
  );
};

export default CodeEditor;
