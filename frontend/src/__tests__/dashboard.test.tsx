import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClinicalDisclaimerBanner } from '../components/ClinicalDisclaimerBanner';
import { PatientEHRCard } from '../components/PatientEHRCard';
import { VitalsQuickBar } from '../components/VitalsQuickBar';
import { RiskScoreGauge } from '../components/RiskScoreGauge';
import { WhatIfLab } from '../components/WhatIfLab';
import { PatientEHR, PredictionResult } from '../types';

describe('GlucoTwin AI Dashboard Components', () => {
  it('renders clinical research prototype banner and disclaimers', () => {
    render(<ClinicalDisclaimerBanner />);
    expect(screen.getByText(/Digital Twin Challenge 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Research Prototype Only/i)).toBeInTheDocument();
  });

  it('renders synthetic patient EHR details properly', () => {
    const mockPatient: PatientEHR = {
      id: 'PT-101',
      name: 'Elena Rostova',
      age: 42,
      gender: 'Female',
      diabetes_type: 'Type 1 Diabetes',
      years_diagnosed: 14.5,
      hba1c: 8.4,
      bmi: 23.2,
      baseline_therapy: ['CSII Pump', 'Continuous CGM'],
      comorbidities: ['Mild Retinopathy'],
      archetype: 'Brittle T1D',
      clinical_notes: 'High glycemic variability.',
      target_range_mg_dl: [70, 180],
      is_synthetic: true,
    };

    render(<PatientEHRCard patient={mockPatient} />);
    expect(screen.getByText('Elena Rostova')).toBeInTheDocument();
    expect(screen.getByText('PT-101')).toBeInTheDocument();
    expect(screen.getByText('8.4%')).toBeInTheDocument();
    expect(screen.getByText('CSII Pump')).toBeInTheDocument();
  });

  it('renders vitals and cgm velocity values', () => {
    render(
      <VitalsQuickBar
        latestReading={{
          timestamp: '2026-10-01T12:00:00',
          glucose_mg_dl: 165.4,
          heart_rate_bpm: 76,
          steps: 220,
          sleep_state: 'awake',
          recent_carbs_g: 0,
          active_insulin_units: 1.8,
          sensor_quality_flag: 'OK',
          is_synthetic: true,
        }}
        trendArrow="RISING"
        rateOfChange={1.4}
        qualityReport={{
          status: 'Optimal',
          overall_score: 95,
          freshness_seconds: 120,
          is_stale: false,
          missing_count_last_2h: 0,
          out_of_range_count_last_2h: 0,
          anomalies: [],
          is_reliable_for_prediction: true,
          disclaimer: 'Research only',
        }}
      />
    );

    expect(screen.getByText('165.4')).toBeInTheDocument();
    expect(screen.getByText('76')).toBeInTheDocument();
    expect(screen.getByText('220')).toBeInTheDocument();
  });

  it('renders risk score gauge with excursion probability', () => {
    const mockPrediction: PredictionResult = {
      patient_id: 'PT-101',
      timestamp: '2026-10-01T12:00:00',
      target_threshold_mg_dl: 180,
      horizon_minutes: 120,
      excursion_risk_probability: 0.725,
      risk_level: 'High',
      confidence_score: 0.88,
      current_glucose: 165.4,
      rate_of_change_mg_dl_per_min: 1.4,
      forecast_curve: [],
      top_contributing_factors: [],
      data_quality_report: {
        status: 'Optimal',
        overall_score: 100,
        freshness_seconds: 60,
        is_stale: false,
        missing_count_last_2h: 0,
        out_of_range_count_last_2h: 0,
        anomalies: [],
        is_reliable_for_prediction: true,
        disclaimer: 'Research prototype',
      },
      model_version: 'GBDT-v1.0',
      disclaimer: 'Research prototype',
    };

    render(<RiskScoreGauge prediction={mockPrediction} />);
    expect(screen.getByText('73%')).toBeInTheDocument(); // rounded 72.5% -> 73%
    expect(screen.getByText(/High Risk/i)).toBeInTheDocument();
  });

  it('renders what-if lab controls and non-causal disclosure', () => {
    render(
      <WhatIfLab
        patientId="PT-101"
        onRunSimulation={vi.fn()}
        scenarioResult={null}
        onClearScenario={vi.fn()}
        isLoading={false}
      />
    );

    expect(screen.getByText(/What-If Counterfactual Lab/i)).toBeInTheDocument();
    expect(screen.getByText(/Mandatory Research Disclosure/i)).toBeInTheDocument();
    expect(screen.getByText(/Never alter prescribed insulin dosages/i)).toBeInTheDocument();
  });
});
