import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './central';
import App2 from './sidebar';
import KPIUploaderCentral from '../components/kpi_formula/central';
import KPIFormula from '../components/kpi-formula/KPIFormula';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);

export default KPIFormula;
