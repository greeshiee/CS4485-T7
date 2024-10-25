import React, { useState } from 'react';
import Navbar from '../components/header';

const UseCase1 = () => {
    const [codeBlocks, setCodeBlocks] = useState(['']);
    const [output, setOutput] = useState('');

    const runButtonClick = (i) => {
        fetch('http://localhost:8000/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: codeBlocks[i] }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            setOutput(data.stdout);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    const addButtonClick = () => {
        setCodeBlocks([...codeBlocks, '']);
    };

    const removeButtonClick = (i) => {
        const newCodeBlocks = codeBlocks.filter((_, index) => index !== i);
        setCodeBlocks(newCodeBlocks);
    };

    return (
        <>
        <Navbar />
        <h1 className="text-foreground dark:text-white font-bold text-2xl md:text-3xl xl:text-4xl pt-24 ml-4">
                Exploratory Data Analysis
        </h1>
        <main className="min-h-screen bg-background flex flex-col h-screen">
            <div className="flex flex-row h-full">
                <section className="flex-1 p-4">
                    <h2 className="text-3xl font-bold">Code</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {codeBlocks.map((code, index) => (
                            <div className="flex flex-row" key={index}>
                                <textarea
                                    className="flex-1 p-4 text-lg bg-background border border-gray-300 rounded-md"
                                    rows={5}
                                    cols={80}
                                    value={code}
                                    onChange={(e) => {
                                        const newCodeBlocks = [...codeBlocks];
                                        newCodeBlocks[index] = e.target.value;
                                        setCodeBlocks(newCodeBlocks);
                                    }}
                                />
                                <div className="flex flex-col p-4">
                                    <button className="mb-4 px-4 py-2 bg-electricblue text-white rounded-md hover:bg-electricblue-dark" onClick={() => runButtonClick(index)}>Run</button>
                                    <button className="mb-4 px-4 py-2 bg-electricblue text-white rounded-md hover:bg-electricblue-dark" onClick={addButtonClick}>Add Cell</button>
                                    <button className="px-4 py-2 bg-electricblue text-white rounded-md hover:bg-electricblue-dark" onClick={() => removeButtonClick(index)}>Remove Cell</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <h2 className="text-3xl font-bold">Output</h2>
                    <textarea className="p-4 text-lg bg-background border border-gray-300 rounded-md" rows={5} cols={80} readOnly value={output}></textarea>
                </section>
                <section className="w-1/3 p-4">
                    <h2 className="text-3xl font-bold">Files</h2>
                    <div className="file-list"></div>
                    <form className="upload-file" onSubmit={(e) => {
                        e.preventDefault();
                        //const formData = new FormData(e.target);
                        //uploadFile(formData);
                    }}>
                        <input type="file" name="file" accept="*/*" required />
                        <button type="submit" className="px-4 py-2 bg-electricblue text-white rounded-md hover:bg-electricblue-dark">Upload</button>
                    </form>
                </section>
            </div>
        </main>
        </>
    );
};

export default UseCase1;

