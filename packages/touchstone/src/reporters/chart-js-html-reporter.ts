import * as FS from 'fs';
import * as Path from 'path';
import { OnTouchStoneEnd, OnTouchStoneStart } from '../decorators';
import { TouchStoneStartEvent, TouchStoneEndEvent } from '../runner/events';
import { SuiteResult } from '../result/suite-result';

const colors: Array<RGB> = [ [0, 200, 0], [200, 0, 0] ];
type RGB = [number, number, number];
const fromHex = (hex: string) => [hex.substring(0,2), hex.substring(2,4), hex.substring(4,6)].map( h => parseInt(h, 16) );
const toHex = (r: number, g: number, b: number) => {
  return [r.toString(16), g.toString(16),  b.toString(16)]
    .map( c =>  c.length === 1 ? '0' + c : c )
    .join('')
};
const spreadColors = (start: RGB, end: RGB, len: number): RGB[] => {
  const slice = 1 / len;
  return Array.from(
    { length: len },
    (v, i) => {
      const ratio = slice * i;
      const iRatio = 1 - ratio;
      return [
        Math.ceil(start[0] * ratio + end[0] * iRatio),
        Math.ceil(start[1] * ratio + end[1] * iRatio),
        Math.ceil(start[2] * ratio + end[2] * iRatio),
      ];
    }
  )
}

const printColors = (colors: RGB[]) => {
  return colors
    .map( c => `rgba(${c.join(', ')}, 0.8)` )
}

function createHorizontalBarChartJsDefinition(result: SuiteResult) {
  return `
{
  type: 'horizontalBar',
  data: {
    labels: ${JSON.stringify(result.cases.map( c => c.name ))},
    datasets: [
      {
        label: "Cases",
        backgroundColor: ${JSON.stringify(printColors(spreadColors(colors[0], colors[1], result.cases.length)))},
        data: ${JSON.stringify(result.cases.map( c => Math.round(c.hz) ).sort() )},
      }
    ]
  },
  options: {
    legend: { display: false },
    title: {
      display: true,
      text: 'Suite: ${result.name}',
      fontSize: 22,
      padding: 24,
    },
    scales: {
      yAxes: [{
        afterFit: function(scaleInstance) {
          scaleInstance.width = 125;
        }
      }],
      xAxes: [
        {
          ticks: {
            beginAtZero: true
          }
        },
      ],
    },
    tooltips: {
      callbacks: {
        label: tooltipItem => tooltipItem.xLabel + ' ops/s'
      }
    },
  }
}`
}

function createCanvas(result: SuiteResult, idx: number) {
  return `
  <div style="max-width: 800px; margin-top: 48px;">
    <canvas id="ts-suite-result-${idx}" width="16" height="9"></canvas>
    <script type="text/javascript">
      (function() {
        const chartData = ${createHorizontalBarChartJsDefinition(result)};
        new Chart(document.getElementById("ts-suite-result-${idx}"), chartData);
      })();
    </script>
  </div>
  `;
}

function createHTML(results: SuiteResult[]) {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" />
      <script src="https://cdn.jsdelivr.net/npm/chart.js@2.8.0/dist/Chart.min.js"></script>
    </head>
    <body>
      <div>
        ${results.map(createCanvas).join('\n')}
      </div>
    </body>
  </html>  
`}

export abstract class ChartJsHtmlReporter {
  chartFile: string;

  @OnTouchStoneStart()
  onChartJsHtmlReporterTouchStoneStart(event: TouchStoneStartEvent) {
    // We use this as a Mixin so constructor will not fire
    // Use this as the initialization point.
    if (!this.chartFile) {
      this.chartFile = 'benchmark-chart.html';
    }
  }

  @OnTouchStoneEnd()
  async onChartJsHtmlReporterFinalize(event: TouchStoneEndEvent) {
    await this.chartJsHtmlReporterSaveFile(createHTML(event.results));
  }

  private async chartJsHtmlReporterSaveFile(html: string) {
    const filePath = Path.isAbsolute(this.chartFile)
      ? this.chartFile
      : Path.join(process.cwd(), this.chartFile)
    ;

    FS.writeFileSync(filePath, html, 'utf8');
  }
}
