import React from 'react';
import LoanRepayment from './components/LoanRepayment'
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactGA from 'react-ga';

const TRACKING_ID = "G-SHTHVH7R2D";

function App() {
  ReactGA.initialize(TRACKING_ID);
  ReactGA.pageview(window.location.pathname + window.location.search);

  return (
    <LoanRepayment mixesForWave={2} />
  )
}

export default App;
