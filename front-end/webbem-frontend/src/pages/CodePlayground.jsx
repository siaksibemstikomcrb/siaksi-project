import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { Play, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// --- CONFIG 13 BAHASA ---
const LANGUAGE_CONFIG = {
    javascript: {
        pistonRuntime: 'node', version: '18.15.0',
        boilerplate: `console.log("Hello from JavaScript!");\n\n// Contoh Loop\nfor(let i=0; i<3; i++) {\n  console.log("Angka: " + i);\n}`
    },
    typescript: {
        pistonRuntime: 'typescript', version: '5.0.3',
        boilerplate: `const message: string = "Hello from TypeScript!";\nconsole.log(message);\n\nfunction add(a: number, b: number): number {\n  return a + b;\n}\nconsole.log("Hasil Tambah:", add(10, 50));`
    },
    python: {
        pistonRuntime: 'python', version: '3.10.0',
        boilerplate: `print("Hello from Python!")\n\n# Contoh Fungsi\ndef greet(name):\n    return f"Hello, {name}"\n\nprint(greet("SIAKSI"))`
    },
    cpp: {
        pistonRuntime: 'cpp', version: '10.2.0',
        boilerplate: `#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}`
    },
    java: {
        pistonRuntime: 'java', version: '15.0.2',
        boilerplate: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}`
    },
    c: {
        pistonRuntime: 'c', version: '10.2.0',
        boilerplate: `#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}`
    },
    csharp: {
        pistonRuntime: 'csharp', version: '6.12.0',
        boilerplate: `using System;\n\npublic class Program {\n    public static void Main() {\n        Console.WriteLine("Hello from C#!");\n    }\n}`
    },
    go: {
        pistonRuntime: 'go', version: '1.16.2',
        boilerplate: `package main\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from Golang!")\n}`
    },
    ruby: {
        pistonRuntime: 'ruby', version: '3.0.1',
        boilerplate: `puts "Hello from Ruby!"`
    },
    php: {
        pistonRuntime: 'php', version: '8.2.3',
        boilerplate: `<?php\n  echo "Hello from PHP!";\n?>`
    },
    kotlin: {
        pistonRuntime: 'kotlin', version: '1.8.20',
        boilerplate: `fun main() {\n    println("Hello from Kotlin!")\n}`
    },
    swift: {
        pistonRuntime: 'swift', version: '5.3.3',
        boilerplate: `print("Hello from Swift!")`
    },
    dart: {
        pistonRuntime: 'dart', version: '2.19.6',
        boilerplate: `void main() {\n  print('Hello from Dart!');\n}`
    }
};

const CodePlayground = ({ defaultLanguage = "javascript" }) => {
    const [code, setCode] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    
    const activeLang = LANGUAGE_CONFIG[defaultLanguage] ? defaultLanguage : 'javascript';

    useEffect(() => {
        setCode(LANGUAGE_CONFIG[activeLang].boilerplate);
        setOutput(""); 
    }, [activeLang]);

    const runCode = async () => {
        setIsRunning(true);
        setOutput("Running...");
        
        try {
            const config = LANGUAGE_CONFIG[activeLang];
            const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
                language: config.pistonRuntime,
                version: config.version,
                files: [{ content: code }]
            });

            const result = response.data.run;
            setOutput(result.output || "No Output");
            
            if (result.stderr) {
                toast.error("Ada error di kodemu!");
            } else {
                toast.success("Berhasil dijalankan!");
            }
        } catch (error) {
            console.error("Compile Error:", error);
            setOutput("Gagal koneksi ke server compiler.");
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e]">
            
            {/* Editor Area */}
            <div className="flex-1 relative group">
                <Editor
                    height="100%"
                    theme="vs-dark"
                    language={activeLang === 'c' || activeLang === 'cpp' ? 'cpp' : activeLang}
                    value={code}
                    onChange={(val) => setCode(val)}
                    options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        // --- FIX TOMBOL NGALANGIN ---
                        // Tambah padding atas lebih besar (60px) biar teks ga ketutup tombol
                        padding: { top: 70, bottom: 20 }, 
                        fontFamily: 'JetBrains Mono, monospace',
                        automaticLayout: true,
                    }}
                />
                
                {/* Tombol Run */}
                <button 
                    onClick={runCode}
                    disabled={isRunning}
                    className="absolute top-4 right-6 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 z-10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed opacity-90 hover:opacity-100"
                >
                    {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor"/>}
                    {isRunning ? 'Running...' : 'Run Code'}
                </button>
            </div>

            {/* Terminal Output */}
            <div className="h-40 bg-[#0d0d0d] border-t border-white/10 flex flex-col shrink-0">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#151515]">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Output Terminal ({activeLang})
                    </span>
                    <button onClick={() => setOutput("")} className="text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                    </button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto font-mono text-sm custom-scrollbar">
                    {output ? (
                        <pre className={`whitespace-pre-wrap ${output.includes("Error") ? "text-red-400" : "text-green-400"}`}>
                            {output}
                        </pre>
                    ) : (
                        <span className="text-gray-600 italic">Hasil kodemu akan muncul di sini...</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CodePlayground;