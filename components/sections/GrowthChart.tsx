'use client';

import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { Dictionary } from '@/lib/translations';

Chart.register(...registerables);

interface Props {
  t: Dictionary;
}

export const GrowthChart: React.FC<Props> = ({ t }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const yrs = 20;
    const labels = [t.chart_start, ...Array.from({ length: yrs }, (_, i) => `${t.chart_year} ${i + 1}`)];
    const modelRate = 0.07;
    const bankRate = 0.007;

    const genesis = Array.from({ length: yrs + 1 }, (_, y) => +(100 * Math.pow(1 + modelRate, y)).toFixed(2));
    const bank = Array.from({ length: yrs + 1 }, (_, y) => +(100 * Math.pow(1 + bankRate, y)).toFixed(2));

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gGrad = ctx.createLinearGradient(0, 0, 0, 340);
    gGrad.addColorStop(0, 'rgba(4, 74, 34, 0.28)');
    gGrad.addColorStop(1, 'rgba(4, 74, 34, 0)');

    const bGrad = ctx.createLinearGradient(0, 0, 0, 340);
    bGrad.addColorStop(0, 'rgba(150, 150, 150, 0.12)');
    bGrad.addColorStop(1, 'rgba(150, 150, 150, 0)');

    const chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: t.growth_legend1,
            data: genesis,
            borderColor: '#044A22',
            backgroundColor: gGrad,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 7,
            pointHoverBackgroundColor: '#044A22',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
          },
          {
            label: t.growth_legend2,
            data: bank,
            borderColor: 'rgba(180, 180, 195, 0.8)',
            backgroundColor: bGrad,
            borderWidth: 1.5,
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderDash: [6, 5],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(5, 20, 12, 0.93)',
            titleColor: 'rgba(255,255,255,0.6)',
            bodyColor: '#fff',
            padding: 16,
            cornerRadius: 10,
            titleFont: { family: 'Inter', size: 11, weight: 'normal' },
            bodyFont: { family: 'Inter', size: 12, weight: 'bold' },
            callbacks: {
              label(c) {
                const g = (Number(c.parsed.y) - 100).toFixed(1).replace('.', ',');
                return `${c.dataset.label}: +${g} %`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(0,0,0,0.03)' },
            ticks: { color: '#9999AA', font: { family: 'Inter', size: 10 }, maxTicksLimit: 11 },
          },
          y: {
            grid: { color: 'rgba(0,0,0,0.03)' },
            ticks: { color: '#9999AA', font: { family: 'Inter', size: 10 }, callback: (v) => v + ' %' },
          },
        },
        animation: { duration: 2000, easing: 'easeInOutQuart' },
      },
    });

    return () => {
      chartInstance.destroy();
    };
  }, [t]);

  return (
    <section className="section section--gray" id="rozvoj" aria-labelledby="rozvoj-h2">
      <div className="container">
        <div className="sec-header sec-header--center reveal">
          <div className="sec-eyebrow">{t.growth_eyebrow}</div>
          <h2
            className="sec-title"
            id="rozvoj-h2"
            dangerouslySetInnerHTML={{ __html: t.growth_title }}
          />
          <p className="sec-desc">{t.growth_desc}</p>
        </div>

        <div className="growth-card reveal reveal-delay-2">
          <div className="growth-header">
            <div>
              <div className="growth-value" id="chart-live-val">+287 %</div>
              <div className="growth-pill" id="chart-live-change">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style={{ display: 'inline', marginRight: 4 }}>
                  <polyline points="18 15 12 9 6 15" />
                </svg>
                <span>{t.growth_pill}</span>
              </div>
            </div>
            <div className="growth-legend">
              <div className="growth-legend-item">
                <div className="growth-legend-dot" style={{ background: 'var(--emerald)' }} />
                <span>{t.growth_legend1}</span>
              </div>
              <div className="growth-legend-item">
                <div className="growth-legend-dot" style={{ background: 'var(--gray-300)' }} />
                <span>{t.growth_legend2}</span>
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', height: '340px', width: '100%' }}>
            <canvas ref={canvasRef} role="img" aria-label="Graf modelového vývoje investičního portfolia G3NE5IS za 20 let" />
          </div>

          <p className="growth-disclaimer">{t.growth_disclaimer}</p>
        </div>
      </div>
    </section>
  );
};
