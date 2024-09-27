import React, { useEffect, useRef, useState } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/css/css';
import 'codemirror/mode/clike/clike'; // for C, C++, Java
import 'codemirror/mode/go/go';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';

import ACTIONS from '../Action';

const languageModes = {
    javascript: { name: 'javascript', json: true },
    python: { name: 'python' },
    html: { name: 'xml' },
    css: { name: 'css' },
    markdown: { name: 'markdown' },
    c: { name: 'text/x-csrc' },      // C language mode
    cpp: { name: 'text/x-c++src' },  // C++ language mode
    java: { name: 'text/x-java' },    // Java language mode
    go: { name: 'go'}
    // Add other languages here
};

const Editor = ({ socketRef, roomId, onCodeChange }) => {
    const editorRef = useRef(null);
    const [language, setLanguage] = useState('javascript');

    useEffect(() => {
        const editor = Codemirror.fromTextArea(
            document.getElementById('realtimeEditor'),
            {
                mode: languageModes[language], // Set mode based on selected language
                theme: 'dracula',
                autoCloseTags: true,
                autoCloseBrackets: true,
                lineNumbers: true,
                
            }
        );

        editorRef.current = editor;

        editor.on('change', (instance, changes) => {
            const { origin } = changes;
            const code = instance.getValue();
            onCodeChange(code);
            if (origin !== 'setValue') {
                socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                    roomId,
                    code,
                });
            }
        });

        // Copy socketRef.current to a local variable
        const socket = socketRef.current;

        if (socket) {
            socket.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code !== null) {
                    editor.setValue(code);
                }
            });
        }

        return () => {
            if (socket) {
                socket.off(ACTIONS.CODE_CHANGE); // Use the local variable in the cleanup
            }
            editor.toTextArea(); // Clean up CodeMirror instance
        };
    }, [socketRef, roomId, onCodeChange, language]); // Re-run the effect when language changes

    // Handle language change
    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
    };

    return (
        <div>
            <select onChange={handleLanguageChange} value={language}>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="markdown">Markdown</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                {/* Add more options as needed */}
                <option value="go">Go</option>
            </select>
            <textarea id="realtimeEditor"></textarea>
        </div>
    );
};

export default Editor;
