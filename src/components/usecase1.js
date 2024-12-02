import React, { useState } from 'react';
import apiClient from '../services/api';

const UseCase1 = () => {
    const [codeBlocks, setCodeBlocks] = useState(['']);
    const [output, setOutput] = useState('');
  
    const runButtonClick = async (i) => {
        try {
          const response = await apiClient.post('/eda/run', { code: codeBlocks[i] });
          setOutput(response.data.stdout);
        } catch (error) {
          console.error('Error:', error);
        }
      };

    const addButtonClick = () => {
        setCodeBlocks([...codeBlocks, '']);
    };

    const removeButtonClick = (i) => {
        const newCodeBlocks = codeBlocks.filter((_, index) => index !== i);
        setCodeBlocks(newCodeBlocks);
    };

    return (
        <div className='h-[calc(100vh-4.5rem)] w-full bg-background overflow-y-auto'>
            <h1 className="text-foreground bg-background font-bold text-2xl md:text-3xl xl:text-4xl pt-24 ml-4">
                Exploratory Data Analysis
            </h1>
            <main className="flex flex-col md:flex-row h-full w-full px-4 py-8">
                <section className="flex-1 md:w-2/3 px-4">
                    <h2 className="text-2xl md:text-3xl font-bold">Code</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {codeBlocks.map((code, index) => (
                            <div className="flex flex-col md:flex-row" key={index}>
                                <textarea
                                    className="flex-1 p-4 text-lg bg-background border border-gray-300 rounded-md resize-none w-full md:w-4/5"
                                    rows={5}
                                    value={code}
                                    onChange={(e) => {
                                        const newCodeBlocks = [...codeBlocks];
                                        newCodeBlocks[index] = e.target.value;
                                        setCodeBlocks(newCodeBlocks);
                                    }}
                                />
                                <div className="flex md:flex-col mt-4 md:mt-0 md:ml-4 space-y-2 md:space-y-4">
                                    <button className="px-4 py-2 bg-electricblue text-white rounded-md hover:bg-electricblue-dark" onClick={() => runButtonClick(index)}>Run</button>
                                    <button className="px-4 py-2 bg-electricblue text-white rounded-md hover:bg-electricblue-dark" onClick={addButtonClick}>Add Cell</button>
                                    <button className="px-4 py-2 bg-electricblue text-white rounded-md hover:bg-electricblue-dark" onClick={() => removeButtonClick(index)}>Remove Cell</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mt-6">Output</h2>
                    <textarea className="p-4 text-lg bg-background border border-gray-300 rounded-md resize-none w-full" rows={5} readOnly value={output}></textarea>
                </section>
                <section className="flex flex-col md:w-1/3 px-4 mt-8 md:mt-0">
                    <h2 className="text-2xl md:text-3xl font-bold">Files</h2>
                    <div className="file-list mt-4"></div>
                    <form className="upload-file mt-4" onSubmit={(e) => {
                        e.preventDefault();
                        //const formData = new FormData(e.target);
                        //uploadFile(formData);
                    }}>
                        <input type="file" name="file" accept="*/*" className="w-full border border-gray-300 rounded-md p-2" required />
                        <button type="submit" className="mt-4 px-4 py-2 bg-electricblue text-white rounded-md hover:bg-electricblue-dark w-full md:w-auto">Upload</button>
                    </form>
                </section>
            </main>
        </div>
    );
};

export default UseCase1;
