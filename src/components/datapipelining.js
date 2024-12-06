import React, { useState } from 'react';

const DataPipelining = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Trigger pipeline function
  const triggerPipeline = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:6789/api/pipeline_schedules/3/pipeline_runs/abc123', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "pipeline_run": {
            "variables": {
              "env": "staging",
              "schema": "public"
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to trigger pipeline');
      }

      const result = await response.json();
      setData(result); // Store the result if needed
      console.log('Pipeline Triggered Successfully', result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Data Pipelining</h1>
      
      {/* Button to trigger pipeline */}
      {/*<button onClick={triggerPipeline}>Trigger Pipeline</button>*/}
      
      {/* Loading state */}
      {/*{loading && <div>Loading...</div>}*/}
      
      {/* Error state */}
      {/*{error && <div>Error: {error}</div>}*/}
      
      {/* Success state */}
      {/*{data && <div>Pipeline Triggered Successfully</div>}*/}

      {/* Display Mage AI Dashboard in an iframe */}
      <div style={{ marginTop: '20px' }}>
        <iframe
          src="http://localhost:6789"
          width="100%"
          height="800px"
          style={{ border: 'none' }}
          title="Mage AI Dashboard"
        />
      </div>
    </div>
  );
};

export default DataPipelining;
