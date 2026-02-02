import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const CodePlayground = () => {
  const [userCode, setUserCode] = useState("// Ketik kodemu di sini...\nconsole.log('Halo SIAKSI!');");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const languages = {
    javascript: { version: "18.15.0", p: "javascript" },
    python: { version: "3.10.0", p: "python" },
    cpp: { version: "10.2.0", p: "c++" },
  };
  
  const runCode = async () => {
    setIsLoading(true);
    setOutput("Running...");
    try {
      const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
        language: languages[language].p,
        version: languages[language].version,
        files: [{ content: userCode }],
      });
      setOutput(response.data.run.stdout || response.data.run.stderr);
    } catch (error) {
      setOutput("Gagal koneksi ke server compiler.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden text-white shadow-lg">
      <div className="flex justify-between items-center p-2 bg-gray-800 border-b border-gray-700">
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-gray-700 text-xs text-white px-2 py-1 rounded border border-gray-600 focus:outline-none"
        >
          <option value="javascript">JavaScript (Node.js)</option>
          <option value="python">Python 3</option>
          <option value="cpp">C++ (G++)</option>
        </select>
        <button 
          onClick={runCode}
          disabled={isLoading}
          className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1 ${isLoading ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {isLoading ? '⏳' : '▶ RUN'}
        </button>
      </div>
      <div className="flex-grow h-64">
        <Editor
          height="100%"
          theme="vs-dark"
          language={language === 'cpp' ? 'cpp' : language}
          value={userCode}
          onChange={(val) => setUserCode(val)}
          options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false }}
        />
      </div>
      <div className="h-32 bg-black p-3 font-mono text-xs border-t border-gray-700 overflow-auto">
        <div className="text-gray-500 mb-1 font-bold">TERMINAL OUTPUT:</div>
        <pre className="text-green-400 whitespace-pre-wrap">{output}</pre>
      </div>
    </div>
  );
};

export default CodePlayground;